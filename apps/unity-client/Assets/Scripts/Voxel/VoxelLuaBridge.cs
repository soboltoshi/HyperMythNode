using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using LastExperiments.Core;
using UnityEngine;

namespace LastExperiments.Voxel
{
    public class VoxelLuaBridge : MonoBehaviour
    {
        [SerializeField] private VoxelWorldRuntime worldRuntime;
        [SerializeField] private VoxelCreatorController creatorController;
        [SerializeField] private KernelClient kernelClient;
        [SerializeField] private GameOfLifeVoxelAdapter gameOfLifeAdapter;
        [SerializeField] private ThreeJsVideoAdapter threeJsVideoAdapter;
        [SerializeField] private bool runStartupScriptOnBoot = true;
        [SerializeField] private string startupScript = "startup.lua";

        private void Awake()
        {
            if (worldRuntime == null)
            {
                worldRuntime = GetComponent<VoxelWorldRuntime>();
            }

            if (creatorController == null)
            {
                creatorController = GetComponent<VoxelCreatorController>();
            }

            if (kernelClient == null)
            {
                kernelClient = FindFirstObjectByType<KernelClient>();
            }

            if (gameOfLifeAdapter == null)
            {
                gameOfLifeAdapter = GetComponent<GameOfLifeVoxelAdapter>();
            }

            if (threeJsVideoAdapter == null)
            {
                threeJsVideoAdapter = GetComponent<ThreeJsVideoAdapter>();
            }
        }

        private void Start()
        {
            if (!runStartupScriptOnBoot)
            {
                return;
            }

            ExecuteScriptFile(startupScript, out _);
        }

        public bool TryExecute(string commandLine, out string result)
        {
            if (string.IsNullOrWhiteSpace(commandLine))
            {
                result = "empty command";
                return false;
            }

            var tokens = Tokenize(commandLine);
            if (tokens.Count == 0)
            {
                result = "empty command";
                return false;
            }

            var command = tokens[0].ToLowerInvariant();
            switch (command)
            {
                case "help":
                    result =
                        "help | set x y z block | fill x1 y1 z1 x2 y2 z2 block | " +
                        "slice y | load_ascii path x y z | run script.lua | select glyph-or-block | " +
                        "cinema token [style] [1d|2d] | life42 [steps] [density] [seed] | " +
                        "threecard token [style] [steps] [density] | " +
                        "contactway pulse [intensity] [duration_ms] [pattern] | contactway stop";
                    return true;
                case "set":
                    return ExecuteSet(tokens, out result);
                case "fill":
                    return ExecuteFill(tokens, out result);
                case "slice":
                    return ExecuteSlice(tokens, out result);
                case "load_ascii":
                    return ExecuteLoadAscii(tokens, out result);
                case "run":
                    return ExecuteRun(tokens, out result);
                case "select":
                    return ExecuteSelect(tokens, out result);
                case "cinema":
                    return ExecuteCinema(tokens, out result);
                case "life42":
                    return ExecuteLife42(tokens, out result);
                case "threecard":
                    return ExecuteThreeCard(tokens, out result);
                case "contactway":
                    return ExecuteContactway(tokens, out result);
                default:
                    result = $"unknown command '{tokens[0]}'";
                    return false;
            }
        }

        public bool ExecuteScriptFile(string scriptName, out string result)
        {
            var path = ResolveLuaPath(scriptName);
            if (!File.Exists(path))
            {
                result = $"script not found: {path}";
                return false;
            }

            var lines = File.ReadAllLines(path);
            var executed = 0;
            var errors = 0;
            foreach (var rawLine in lines)
            {
                var line = rawLine.Trim();
                if (string.IsNullOrWhiteSpace(line)
                    || line.StartsWith("--", StringComparison.Ordinal)
                    || line.StartsWith("#", StringComparison.Ordinal))
                {
                    continue;
                }

                if (TryExecute(line, out _))
                {
                    executed++;
                }
                else
                {
                    errors++;
                }
            }

            result = $"script {scriptName}: executed {executed}, errors {errors}";
            return errors == 0;
        }

        private bool ExecuteSet(IReadOnlyList<string> tokens, out string result)
        {
            if (tokens.Count < 5)
            {
                result = "usage: set x y z block";
                return false;
            }

            if (!TryReadInt(tokens[1], out var x)
                || !TryReadInt(tokens[2], out var y)
                || !TryReadInt(tokens[3], out var z))
            {
                result = "set requires integer x y z";
                return false;
            }

            if (!TryReadBlock(tokens[4], out var block))
            {
                result = $"unknown block '{tokens[4]}'";
                return false;
            }

            if (worldRuntime == null)
            {
                result = "voxel world missing";
                return false;
            }

            var ok = worldRuntime.SetBlock(new Vector3Int(x, y, z), block);
            result = ok ? $"set {x} {y} {z} {block}" : "set failed (out of bounds)";
            return ok;
        }

        private bool ExecuteFill(IReadOnlyList<string> tokens, out string result)
        {
            if (tokens.Count < 8)
            {
                result = "usage: fill x1 y1 z1 x2 y2 z2 block";
                return false;
            }

            if (!TryReadInt(tokens[1], out var x1)
                || !TryReadInt(tokens[2], out var y1)
                || !TryReadInt(tokens[3], out var z1)
                || !TryReadInt(tokens[4], out var x2)
                || !TryReadInt(tokens[5], out var y2)
                || !TryReadInt(tokens[6], out var z2))
            {
                result = "fill requires integer coordinates";
                return false;
            }

            if (!TryReadBlock(tokens[7], out var block))
            {
                result = $"unknown block '{tokens[7]}'";
                return false;
            }

            if (worldRuntime == null)
            {
                result = "voxel world missing";
                return false;
            }

            var minX = Mathf.Min(x1, x2);
            var maxX = Mathf.Max(x1, x2);
            var minY = Mathf.Min(y1, y2);
            var maxY = Mathf.Max(y1, y2);
            var minZ = Mathf.Min(z1, z2);
            var maxZ = Mathf.Max(z1, z2);

            var changed = 0;
            for (var x = minX; x <= maxX; x++)
            {
                for (var y = minY; y <= maxY; y++)
                {
                    for (var z = minZ; z <= maxZ; z++)
                    {
                        if (worldRuntime.SetBlock(new Vector3Int(x, y, z), block))
                        {
                            changed++;
                        }
                    }
                }
            }

            result = $"fill changed {changed} blocks";
            return changed > 0;
        }

        private bool ExecuteSlice(IReadOnlyList<string> tokens, out string result)
        {
            if (tokens.Count < 2 || !TryReadInt(tokens[1], out var y))
            {
                result = "usage: slice y";
                return false;
            }

            if (worldRuntime == null)
            {
                result = "voxel world missing";
                return false;
            }

            result = worldRuntime.RenderAsciiSlice(y);
            return true;
        }

        private bool ExecuteLoadAscii(IReadOnlyList<string> tokens, out string result)
        {
            if (tokens.Count < 5)
            {
                result = "usage: load_ascii relativePath x y z";
                return false;
            }

            var path = ResolveLuaPath(tokens[1]);
            if (!File.Exists(path))
            {
                result = $"file not found: {path}";
                return false;
            }

            if (!TryReadInt(tokens[2], out var x)
                || !TryReadInt(tokens[3], out var y)
                || !TryReadInt(tokens[4], out var z))
            {
                result = "load_ascii requires integer origin x y z";
                return false;
            }

            if (worldRuntime == null)
            {
                result = "voxel world missing";
                return false;
            }

            var lines = File.ReadAllLines(path);
            var changed = worldRuntime.ApplyAsciiStructure(lines, new Vector3Int(x, y, z));
            result = $"ascii loaded, changed {changed} blocks";
            return true;
        }

        private bool ExecuteRun(IReadOnlyList<string> tokens, out string result)
        {
            if (tokens.Count < 2)
            {
                result = "usage: run script.lua";
                return false;
            }

            return ExecuteScriptFile(tokens[1], out result);
        }

        private bool ExecuteSelect(IReadOnlyList<string> tokens, out string result)
        {
            if (tokens.Count < 2)
            {
                result = "usage: select glyph-or-block";
                return false;
            }

            if (creatorController == null)
            {
                result = "creator controller missing";
                return false;
            }

            var token = tokens[1];
            if (TryReadBlock(token, out var block))
            {
                creatorController.SelectByGlyph(VoxelBlockRules.GetGlyph(block));
                result = $"selected {block}";
                return true;
            }

            if (token.Length == 1 && creatorController.SelectByGlyph(token[0]))
            {
                result = $"selected '{token[0]}'";
                return true;
            }

            result = $"unknown block or glyph '{token}'";
            return false;
        }

        private bool ExecuteCinema(IReadOnlyList<string> tokens, out string result)
        {
            if (tokens.Count < 2)
            {
                result = "usage: cinema token_address [style_preset] [1d|2d]";
                return false;
            }

            if (kernelClient == null)
            {
                result = "kernel client missing";
                return false;
            }

            var tokenAddress = tokens[1].Trim();
            var stylePreset = tokens.Count >= 3 ? tokens[2].Trim() : "hyperflow_assembly";
            var packageType = tokens.Count >= 4 && tokens[3].Trim().ToLowerInvariant() == "2d" ? "2d" : "1d";

            var request = new KernelCommandRequest
            {
                kind = "CreateCinemaExperiment",
                payload = new KernelCommandPayload
                {
                    surface = "quest3",
                    mode = "vr",
                    intent = "CreateCinemaExperiment",
                    note = "creator shell cinema proposal",
                    source = "creator-shell",
                    route = "lua-cinema-verb",
                    token_address = tokenAddress,
                    chain = "auto",
                    package_type = packageType,
                    style_preset = stylePreset,
                    payment_route = "sol_direct"
                }
            };

            kernelClient.SendCommand(
                request,
                receipt => Debug.Log($"Cinema proposal receipt: {receipt.receipt} / {receipt.note}"),
                error => Debug.LogError($"Cinema proposal failed: {error}"));

            result = $"proposed cinema experiment for {tokenAddress} ({stylePreset}, {packageType})";
            return true;
        }

        private bool ExecuteLife42(IReadOnlyList<string> tokens, out string result)
        {
            if (worldRuntime == null)
            {
                result = "voxel world missing";
                return false;
            }

            if (gameOfLifeAdapter == null)
            {
                result = "GameOfLife adapter missing";
                return false;
            }

            var steps = 7;
            if (tokens.Count >= 2 && TryReadInt(tokens[1], out var parsedSteps))
            {
                steps = Mathf.Clamp(parsedSteps, 1, 48);
            }

            var density = 0.22f;
            if (tokens.Count >= 3 && TryReadFloat(tokens[2], out var parsedDensity))
            {
                density = Mathf.Clamp(parsedDensity, 0.05f, 0.85f);
            }

            var seed = Environment.TickCount;
            if (tokens.Count >= 4 && TryReadInt(tokens[3], out var parsedSeed))
            {
                seed = parsedSeed;
            }

            var generation = gameOfLifeAdapter.GenerateIntoWorld(
                worldRuntime,
                new GameOfLifeGenerationOptions
                {
                    width = 42,
                    height = 42,
                    depth = 42,
                    steps = steps,
                    seedDensity = density,
                    randomSeed = seed
                });

            result =
                $"life42 generated {generation.width}x{generation.height}x{generation.depth} " +
                $"steps={generation.steps} seed={generation.randomSeed} alive={generation.aliveCells}";
            return true;
        }

        private bool ExecuteThreeCard(IReadOnlyList<string> tokens, out string result)
        {
            if (tokens.Count < 2)
            {
                result = "usage: threecard token_address [style_preset] [steps] [density]";
                return false;
            }

            if (threeJsVideoAdapter == null)
            {
                result = "ThreeJs adapter missing";
                return false;
            }

            if (worldRuntime == null)
            {
                result = "voxel world missing";
                return false;
            }

            var tokenAddress = tokens[1].Trim();
            var stylePreset = tokens.Count >= 3 ? tokens[2].Trim() : "hyperflow_assembly";
            var steps = 7;
            if (tokens.Count >= 4 && TryReadInt(tokens[3], out var parsedSteps))
            {
                steps = Mathf.Clamp(parsedSteps, 1, 48);
            }

            var density = 0.22f;
            if (tokens.Count >= 5 && TryReadFloat(tokens[4], out var parsedDensity))
            {
                density = Mathf.Clamp(parsedDensity, 0.05f, 0.85f);
            }

            var descriptor = threeJsVideoAdapter.BuildCardDescriptor(
                tokenAddress,
                stylePreset,
                worldRuntime.WorldSize,
                $"threecard {tokenAddress} {stylePreset}");

            if (gameOfLifeAdapter == null)
            {
                result =
                    $"three.js descriptor prepared for {descriptor.token_address} " +
                    $"seed={descriptor.random_seed} (GameOfLife adapter unavailable)";
                return true;
            }

            var generation = gameOfLifeAdapter.GenerateIntoWorld(
                worldRuntime,
                new GameOfLifeGenerationOptions
                {
                    width = 42,
                    height = 42,
                    depth = 42,
                    steps = steps,
                    seedDensity = density,
                    randomSeed = descriptor.random_seed
                });

            result =
                $"threecard seeded world with token={descriptor.token_address} style={descriptor.style_preset} " +
                $"seed={descriptor.random_seed} alive={generation.aliveCells}";
            return true;
        }

        private bool ExecuteContactway(IReadOnlyList<string> tokens, out string result)
        {
            if (kernelClient == null)
            {
                result = "kernel client missing";
                return false;
            }

            if (tokens.Count < 2)
            {
                result = "usage: contactway pulse [intensity] [duration_ms] [pattern] | contactway stop";
                return false;
            }

            var mode = tokens[1].Trim().ToLowerInvariant();
            var channel = "pulse";
            var pattern = "vr_ping";
            var intensity = 0.65f;
            var durationMs = 220;

            if (mode == "stop")
            {
                channel = "stop";
                pattern = "stop";
                intensity = 0f;
                durationMs = 0;
            }
            else if (mode == "pulse")
            {
                if (tokens.Count >= 3 && TryReadFloat(tokens[2], out var parsedIntensity))
                {
                    intensity = Mathf.Clamp(parsedIntensity, 0f, 1f);
                }

                if (tokens.Count >= 4 && TryReadInt(tokens[3], out var parsedDuration))
                {
                    durationMs = Mathf.Clamp(parsedDuration, 0, 20000);
                }

                if (tokens.Count >= 5 && !string.IsNullOrWhiteSpace(tokens[4]))
                {
                    pattern = tokens[4].Trim();
                }
            }
            else
            {
                result = "usage: contactway pulse [intensity] [duration_ms] [pattern] | contactway stop";
                return false;
            }

            var request = new KernelCommandRequest
            {
                kind = "contactway.intent",
                payload = new KernelCommandPayload
                {
                    surface = "quest3",
                    mode = "vr",
                    intent = "contactway-intent",
                    note = "creator shell contactway command",
                    source = "creator-shell",
                    route = "lua-contactway",
                    channel = channel,
                    pattern = pattern,
                    intensity = intensity,
                    duration_ms = durationMs
                }
            };

            kernelClient.SendCommand(
                request,
                receipt => Debug.Log($"Contactway receipt: {receipt.receipt} / {receipt.note}"),
                error => Debug.LogError($"Contactway command failed: {error}"));

            result =
                $"contactway {channel} pattern={pattern} intensity={intensity.ToString(\"0.00\", CultureInfo.InvariantCulture)} duration_ms={durationMs}";
            return true;
        }

        private static List<string> Tokenize(string commandLine)
        {
            var pieces = commandLine.Split(new[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);
            return new List<string>(pieces);
        }

        private static bool TryReadInt(string value, out int parsed)
        {
            return int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out parsed);
        }

        private static bool TryReadFloat(string value, out float parsed)
        {
            return float.TryParse(value, NumberStyles.Float, CultureInfo.InvariantCulture, out parsed);
        }

        private static bool TryReadBlock(string token, out VoxelBlockType block)
        {
            if (Enum.TryParse(token, true, out block))
            {
                return true;
            }

            if (token.Length == 1 && VoxelBlockRules.TryParseGlyph(token[0], out block))
            {
                return true;
            }

            block = VoxelBlockType.Empty;
            return false;
        }

        private static string ResolveLuaPath(string scriptName)
        {
            if (Path.IsPathRooted(scriptName))
            {
                return scriptName;
            }

            var normalized = scriptName.Replace('/', Path.DirectorySeparatorChar);
            return Path.Combine(Application.streamingAssetsPath, "Lua", normalized);
        }
    }
}
