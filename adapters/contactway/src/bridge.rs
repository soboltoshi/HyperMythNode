use buttplug::client::{ButtplugClient, ButtplugClientEvent, ScalarValueCommand};
use buttplug::core::connector::new_json_ws_client_connector;
use futures::StreamExt;
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::time::{sleep, Duration};

use crate::{ContactwayDeviceInfo, ContactwayDeviceResult, ContactwayIntent};

/// Bridge to an Intiface Central / buttplug.io server over WebSocket.
pub struct ContactwayBridge {
    client: Arc<Mutex<Option<ButtplugClient>>>,
    bridge_url: Arc<Mutex<String>>,
    connected: Arc<Mutex<bool>>,
}

impl ContactwayBridge {
    pub fn new() -> Self {
        Self {
            client: Arc::new(Mutex::new(None)),
            bridge_url: Arc::new(Mutex::new(String::new())),
            connected: Arc::new(Mutex::new(false)),
        }
    }

    /// Connect to an Intiface Central / buttplug server at the given WebSocket URL.
    pub async fn connect(&self, url: &str) -> Result<(), String> {
        let mut client_lock = self.client.lock().await;

        // Disconnect existing client if any
        if let Some(existing) = client_lock.take() {
            let _ = existing.disconnect().await;
        }

        let client = ButtplugClient::new("HyperMythsX-Contactway");

        let connector = new_json_ws_client_connector(url);

        client
            .connect(connector)
            .await
            .map_err(|e| format!("buttplug connect failed: {e}"))?;

        // Spawn event handler to track disconnects
        let connected_flag = self.connected.clone();
        let mut event_stream = client.event_stream();
        tokio::spawn(async move {
            while let Some(event) = event_stream.next().await {
                if let ButtplugClientEvent::ServerDisconnect = event {
                    let mut flag = connected_flag.lock().await;
                    *flag = false;
                    break;
                }
            }
        });

        *self.bridge_url.lock().await = url.to_string();
        *self.connected.lock().await = true;
        *client_lock = Some(client);

        Ok(())
    }

    /// Disconnect from the buttplug server.
    pub async fn disconnect(&self) -> Result<(), String> {
        let mut client_lock = self.client.lock().await;
        if let Some(client) = client_lock.take() {
            client
                .disconnect()
                .await
                .map_err(|e| format!("disconnect failed: {e}"))?;
        }
        *self.connected.lock().await = false;
        Ok(())
    }

    /// Check if currently connected.
    pub async fn is_connected(&self) -> bool {
        *self.connected.lock().await
    }

    /// Scan for available devices (waits briefly for discovery).
    pub async fn scan_devices(&self) -> Result<Vec<ContactwayDeviceInfo>, String> {
        let client_lock = self.client.lock().await;
        let client = client_lock
            .as_ref()
            .ok_or_else(|| "not connected".to_string())?;

        client
            .start_scanning()
            .await
            .map_err(|e| format!("scan failed: {e}"))?;

        // Allow 2 seconds for device discovery
        sleep(Duration::from_secs(2)).await;

        let _ = client.stop_scanning().await;

        let devices: Vec<ContactwayDeviceInfo> = client
            .devices()
            .iter()
            .map(|d| ContactwayDeviceInfo {
                name: d.name().to_string(),
                supports_vibrate: d.vibrate_attributes().len() > 0,
                supports_rotate: d.rotate_attributes().len() > 0,
                supports_linear: d.linear_attributes().len() > 0,
            })
            .collect();

        Ok(devices)
    }

    /// Send an intent to the first available vibrating device.
    pub async fn send_intent(&self, intent: &ContactwayIntent) -> ContactwayDeviceResult {
        let client_lock = self.client.lock().await;
        let client = match client_lock.as_ref() {
            Some(c) => c,
            None => {
                return ContactwayDeviceResult {
                    forwarded: false,
                    device_name: None,
                    note: "not connected to buttplug server".to_string(),
                }
            }
        };

        match intent.channel.as_str() {
            "stop" => {
                let mut stopped = false;
                for device in client.devices() {
                    if device.stop().await.is_ok() {
                        stopped = true;
                    }
                }
                ContactwayDeviceResult {
                    forwarded: stopped,
                    device_name: None,
                    note: if stopped {
                        "all devices stopped".to_string()
                    } else {
                        "no devices to stop".to_string()
                    },
                }
            }
            "pulse" | "pattern" | "card-feedback" => {
                let intensity = intent.intensity.clamp(0.0, 1.0) as f64;
                let duration = Duration::from_millis(intent.duration_ms.min(20_000));

                // Find first device that supports vibration
                for device in client.devices() {
                    if !device.vibrate_attributes().is_empty() {
                        let cmd = ScalarValueCommand::ScalarValue(intensity);
                        match device.vibrate(&cmd).await {
                            Ok(()) => {
                                let device_name = device.name().to_string();

                                // Schedule stop after duration
                                let dev = device.clone();
                                tokio::spawn(async move {
                                    sleep(duration).await;
                                    let _ = dev.stop().await;
                                });

                                return ContactwayDeviceResult {
                                    forwarded: true,
                                    device_name: Some(device_name.clone()),
                                    note: format!(
                                        "{} @ {:.0}% for {}ms (pattern: {})",
                                        device_name,
                                        intensity * 100.0,
                                        intent.duration_ms,
                                        intent.pattern
                                    ),
                                };
                            }
                            Err(e) => {
                                return ContactwayDeviceResult {
                                    forwarded: false,
                                    device_name: Some(device.name().to_string()),
                                    note: format!("vibrate command failed: {e}"),
                                };
                            }
                        }
                    }
                }

                ContactwayDeviceResult {
                    forwarded: false,
                    device_name: None,
                    note: "no vibration-capable devices found".to_string(),
                }
            }
            other => ContactwayDeviceResult {
                forwarded: false,
                device_name: None,
                note: format!("unsupported channel: {other}"),
            },
        }
    }
}

impl Default for ContactwayBridge {
    fn default() -> Self {
        Self::new()
    }
}
