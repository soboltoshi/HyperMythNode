using System.Collections.Generic;
using System.Text;
using UnityEngine;

namespace LastExperiments.Voxel
{
    public static class VoxelAsciiPalette
    {
        public static string RenderSlice(VoxelBlockType[,,] blocks, int y)
        {
            if (blocks == null)
            {
                return string.Empty;
            }

            var sizeX = blocks.GetLength(0);
            var sizeY = blocks.GetLength(1);
            var sizeZ = blocks.GetLength(2);

            if (y < 0 || y >= sizeY)
            {
                return string.Empty;
            }

            var buffer = new StringBuilder(sizeZ * (sizeX + 1));
            for (var z = 0; z < sizeZ; z++)
            {
                for (var x = 0; x < sizeX; x++)
                {
                    buffer.Append(VoxelBlockRules.GetGlyph(blocks[x, y, z]));
                }

                if (z < sizeZ - 1)
                {
                    buffer.Append('\n');
                }
            }

            return buffer.ToString();
        }

        public static List<(Vector3Int position, VoxelBlockType block)> ParseStructure(
            string[] lines,
            Vector3Int origin)
        {
            var placements = new List<(Vector3Int position, VoxelBlockType block)>();
            if (lines == null || lines.Length == 0)
            {
                return placements;
            }

            for (var z = 0; z < lines.Length; z++)
            {
                var line = lines[z];
                for (var x = 0; x < line.Length; x++)
                {
                    if (!VoxelBlockRules.TryParseGlyph(line[x], out var blockType))
                    {
                        continue;
                    }

                    if (blockType == VoxelBlockType.Empty)
                    {
                        continue;
                    }

                    placements.Add((new Vector3Int(origin.x + x, origin.y, origin.z + z), blockType));
                }
            }

            return placements;
        }
    }
}
