using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using UnityEngine;

namespace LastExperiments.Voxel
{
    public class VoxelLuaBridge : MonoBehaviour
    {
        [SerializeField] private VoxelWorldRuntime worldRuntime;
        [SerializeField] private VoxelCreatorController creatorController;
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
                        "slice y | load_ascii path x y z | run script.lua | select glyph-or-block";
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

        private static List<string> Tokenize(string commandLine)
        {
            var pieces = commandLine.Split(new[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);
            return new List<string>(pieces);
        }

        private static bool TryReadInt(string value, out int parsed)
        {
            return int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out parsed);
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
