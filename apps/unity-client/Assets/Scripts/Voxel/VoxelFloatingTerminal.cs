using System.Collections.Generic;
using UnityEngine;

namespace LastExperiments.Voxel
{
    public class VoxelFloatingTerminal : MonoBehaviour
    {
        [SerializeField] private Transform headAnchor;
        [SerializeField] private VoxelLuaBridge luaBridge;
        [SerializeField] private bool visible = true;
        [SerializeField] private TextMesh textMesh;
        [SerializeField] private float forwardDistance = 0.75f;
        [SerializeField] private float verticalOffset = -0.1f;

        private readonly List<string> history = new();
        private readonly List<string> presetCommands = new()
        {
            "help",
            "slice 8",
            "set 21 9 21 Gold",
            "fill 18 8 18 24 8 24 Stone",
            "load_ascii structures/camp.txt 16 9 16"
        };

        private int presetIndex;

        private void Awake()
        {
            EnsureVisual();
            Append("terminal booted");
        }

        private void LateUpdate()
        {
            if (!visible || textMesh == null || headAnchor == null)
            {
                return;
            }

            transform.position = headAnchor.position + (headAnchor.forward * forwardDistance) + (headAnchor.up * verticalOffset);
            transform.rotation = Quaternion.LookRotation(transform.position - headAnchor.position, Vector3.up);
        }

        public void Initialize(Transform head, VoxelLuaBridge bridge)
        {
            headAnchor = head;
            luaBridge = bridge;
            RefreshText();
        }

        public void Toggle()
        {
            visible = !visible;
            if (textMesh != null)
            {
                textMesh.gameObject.SetActive(visible);
            }
        }

        public void CyclePreset(int delta)
        {
            if (presetCommands.Count == 0)
            {
                return;
            }

            presetIndex += delta;
            if (presetIndex < 0)
            {
                presetIndex = presetCommands.Count - 1;
            }
            else if (presetIndex >= presetCommands.Count)
            {
                presetIndex = 0;
            }

            Append($"selected: {presetCommands[presetIndex]}");
        }

        public void ExecuteCurrentPreset()
        {
            if (presetCommands.Count == 0)
            {
                return;
            }

            Execute(presetCommands[presetIndex]);
        }

        public void Execute(string command)
        {
            if (string.IsNullOrWhiteSpace(command))
            {
                return;
            }

            Append($"> {command}");
            if (luaBridge == null)
            {
                Append("lua bridge missing");
                return;
            }

            if (luaBridge.TryExecute(command, out var result))
            {
                Append(result);
            }
            else
            {
                Append($"error: {result}");
            }
        }

        public void Append(string line)
        {
            history.Add(line);
            while (history.Count > 10)
            {
                history.RemoveAt(0);
            }

            RefreshText();
        }

        private void RefreshText()
        {
            if (textMesh == null)
            {
                return;
            }

            var banner =
                "Floating Terminal\n" +
                "L-Secondary: toggle\n" +
                "L-Grip: voice capture\n" +
                "R-Secondary: run preset\n";

            var body = string.Join("\n", history);
            textMesh.text = $"{banner}\n{body}";
        }

        private void EnsureVisual()
        {
            if (textMesh != null)
            {
                return;
            }

            var panel = new GameObject("FloatingTerminalText");
            panel.transform.SetParent(transform, false);
            textMesh = panel.AddComponent<TextMesh>();
            textMesh.anchor = TextAnchor.UpperLeft;
            textMesh.alignment = TextAlignment.Left;
            textMesh.characterSize = 0.015f;
            textMesh.fontSize = 52;
            textMesh.color = new Color(0.84f, 0.98f, 1f, 1f);
            textMesh.gameObject.SetActive(visible);
        }
    }
}
