using System.Collections.Generic;
using UnityEngine;

namespace LastExperiments.Voxel
{
    public static class VoxelBlockRules
    {
        private static readonly VoxelBlockType[] Palette =
        {
            VoxelBlockType.Grass,
            VoxelBlockType.Dirt,
            VoxelBlockType.Stone,
            VoxelBlockType.Water,
            VoxelBlockType.Lava,
            VoxelBlockType.Sand,
            VoxelBlockType.Wood,
            VoxelBlockType.Leaf,
            VoxelBlockType.Snow,
            VoxelBlockType.Ice,
            VoxelBlockType.Gold,
            VoxelBlockType.Coal,
            VoxelBlockType.Ruby
        };

        private static readonly Dictionary<VoxelBlockType, char> GlyphByType = new()
        {
            { VoxelBlockType.Empty, '.' },
            { VoxelBlockType.Grass, 'G' },
            { VoxelBlockType.Dirt, 'D' },
            { VoxelBlockType.Stone, 'S' },
            { VoxelBlockType.Lava, 'L' },
            { VoxelBlockType.Water, 'W' },
            { VoxelBlockType.Snow, 'N' },
            { VoxelBlockType.Bedrock, 'B' },
            { VoxelBlockType.Wood, 'T' },
            { VoxelBlockType.Leaf, 'F' },
            { VoxelBlockType.Ice, 'I' },
            { VoxelBlockType.RedFlower, 'R' },
            { VoxelBlockType.CrossGrass, 'C' },
            { VoxelBlockType.Mushroom, 'M' },
            { VoxelBlockType.LakeBottom, 'K' },
            { VoxelBlockType.Sand, 'A' },
            { VoxelBlockType.Evil, 'E' },
            { VoxelBlockType.LeafMold, 'O' },
            { VoxelBlockType.FrozeDirt, 'P' },
            { VoxelBlockType.GreyMushroom, 'H' },
            { VoxelBlockType.Bush, 'U' },
            { VoxelBlockType.DeadBranch, 'Y' },
            { VoxelBlockType.Gold, '1' },
            { VoxelBlockType.Coal, '2' },
            { VoxelBlockType.Ruby, '3' },
            { VoxelBlockType.YellowRock, '4' },
            { VoxelBlockType.OrangeRock, '5' },
            { VoxelBlockType.RedRock, '6' },
            { VoxelBlockType.Cloud, '~' }
        };

        private static readonly Dictionary<char, VoxelBlockType> TypeByGlyph = new()
        {
            { '.', VoxelBlockType.Empty },
            { 'G', VoxelBlockType.Grass },
            { 'D', VoxelBlockType.Dirt },
            { 'S', VoxelBlockType.Stone },
            { 'L', VoxelBlockType.Lava },
            { 'W', VoxelBlockType.Water },
            { 'N', VoxelBlockType.Snow },
            { 'B', VoxelBlockType.Bedrock },
            { 'T', VoxelBlockType.Wood },
            { 'F', VoxelBlockType.Leaf },
            { 'I', VoxelBlockType.Ice },
            { 'R', VoxelBlockType.RedFlower },
            { 'C', VoxelBlockType.CrossGrass },
            { 'M', VoxelBlockType.Mushroom },
            { 'K', VoxelBlockType.LakeBottom },
            { 'A', VoxelBlockType.Sand },
            { 'E', VoxelBlockType.Evil },
            { 'O', VoxelBlockType.LeafMold },
            { 'P', VoxelBlockType.FrozeDirt },
            { 'H', VoxelBlockType.GreyMushroom },
            { 'U', VoxelBlockType.Bush },
            { 'Y', VoxelBlockType.DeadBranch },
            { '1', VoxelBlockType.Gold },
            { '2', VoxelBlockType.Coal },
            { '3', VoxelBlockType.Ruby },
            { '4', VoxelBlockType.YellowRock },
            { '5', VoxelBlockType.OrangeRock },
            { '6', VoxelBlockType.RedRock },
            { '~', VoxelBlockType.Cloud }
        };

        private static readonly Dictionary<VoxelBlockType, Color> ColorByType = new()
        {
            { VoxelBlockType.Empty, new Color(0f, 0f, 0f, 0f) },
            { VoxelBlockType.Grass, new Color(0.24f, 0.64f, 0.22f, 1f) },
            { VoxelBlockType.Dirt, new Color(0.43f, 0.30f, 0.19f, 1f) },
            { VoxelBlockType.Stone, new Color(0.52f, 0.54f, 0.57f, 1f) },
            { VoxelBlockType.Lava, new Color(0.95f, 0.32f, 0.08f, 0.76f) },
            { VoxelBlockType.Water, new Color(0.16f, 0.42f, 0.82f, 0.62f) },
            { VoxelBlockType.Snow, new Color(0.88f, 0.90f, 0.95f, 1f) },
            { VoxelBlockType.Bedrock, new Color(0.14f, 0.14f, 0.16f, 1f) },
            { VoxelBlockType.Wood, new Color(0.49f, 0.34f, 0.20f, 1f) },
            { VoxelBlockType.Leaf, new Color(0.21f, 0.53f, 0.19f, 0.8f) },
            { VoxelBlockType.Ice, new Color(0.64f, 0.83f, 0.95f, 0.6f) },
            { VoxelBlockType.RedFlower, new Color(0.88f, 0.16f, 0.16f, 0.9f) },
            { VoxelBlockType.CrossGrass, new Color(0.35f, 0.73f, 0.24f, 0.9f) },
            { VoxelBlockType.Mushroom, new Color(0.72f, 0.34f, 0.22f, 0.9f) },
            { VoxelBlockType.LakeBottom, new Color(0.19f, 0.16f, 0.11f, 1f) },
            { VoxelBlockType.Sand, new Color(0.89f, 0.83f, 0.59f, 1f) },
            { VoxelBlockType.Evil, new Color(0.25f, 0.15f, 0.15f, 1f) },
            { VoxelBlockType.LeafMold, new Color(0.26f, 0.33f, 0.17f, 1f) },
            { VoxelBlockType.FrozeDirt, new Color(0.49f, 0.46f, 0.42f, 1f) },
            { VoxelBlockType.GreyMushroom, new Color(0.50f, 0.50f, 0.52f, 0.9f) },
            { VoxelBlockType.Bush, new Color(0.29f, 0.50f, 0.28f, 0.9f) },
            { VoxelBlockType.DeadBranch, new Color(0.47f, 0.39f, 0.32f, 0.95f) },
            { VoxelBlockType.Gold, new Color(0.91f, 0.76f, 0.11f, 1f) },
            { VoxelBlockType.Coal, new Color(0.10f, 0.10f, 0.11f, 1f) },
            { VoxelBlockType.Ruby, new Color(0.75f, 0.08f, 0.22f, 1f) },
            { VoxelBlockType.YellowRock, new Color(0.77f, 0.68f, 0.36f, 1f) },
            { VoxelBlockType.OrangeRock, new Color(0.78f, 0.45f, 0.19f, 1f) },
            { VoxelBlockType.RedRock, new Color(0.62f, 0.24f, 0.17f, 1f) },
            { VoxelBlockType.Cloud, new Color(0.92f, 0.94f, 0.98f, 0.48f) }
        };

        public static IReadOnlyList<VoxelBlockType> BuildPalette => Palette;

        public static bool IsCrossType(VoxelBlockType type)
        {
            return type == VoxelBlockType.RedFlower
                   || type == VoxelBlockType.CrossGrass
                   || type == VoxelBlockType.Mushroom
                   || type == VoxelBlockType.GreyMushroom
                   || type == VoxelBlockType.Bush
                   || type == VoxelBlockType.DeadBranch;
        }

        public static bool IsLiquid(VoxelBlockType type)
        {
            return type == VoxelBlockType.Water
                   || type == VoxelBlockType.Lava;
        }

        public static bool IsOpaque(VoxelBlockType type)
        {
            if (type == VoxelBlockType.Empty
                || type == VoxelBlockType.Cloud
                || type == VoxelBlockType.Ice
                || IsLiquid(type)
                || IsCrossType(type))
            {
                return false;
            }

            return true;
        }

        public static bool IsCollidable(VoxelBlockType type)
        {
            if (type == VoxelBlockType.Empty
                || type == VoxelBlockType.Cloud
                || type == VoxelBlockType.Water
                || IsCrossType(type))
            {
                return false;
            }

            return true;
        }

        public static bool IsTransparent(VoxelBlockType type)
        {
            return !IsOpaque(type);
        }

        public static char GetGlyph(VoxelBlockType type)
        {
            if (GlyphByType.TryGetValue(type, out var glyph))
            {
                return glyph;
            }

            return '?';
        }

        public static bool TryParseGlyph(char glyph, out VoxelBlockType type)
        {
            return TypeByGlyph.TryGetValue(char.ToUpperInvariant(glyph), out type);
        }

        public static Color GetColor(VoxelBlockType type)
        {
            if (ColorByType.TryGetValue(type, out var color))
            {
                return color;
            }

            return new Color(1f, 0f, 1f, 1f);
        }
    }
}
