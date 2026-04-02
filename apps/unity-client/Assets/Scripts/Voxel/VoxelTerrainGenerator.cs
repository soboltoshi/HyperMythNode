using UnityEngine;

namespace LastExperiments.Voxel
{
    public static class VoxelTerrainGenerator
    {
        private static readonly VoxelFbmParams DarkParameters = new(
            exponent: 3,
            scaleY: 60f,
            offsetY: 10);

        private static readonly VoxelFbmParams DesertParameters = new(
            exponent: 1,
            scaleY: 4f);

        private static readonly VoxelFbmParams FrozenParameters = new(
            exponent: 5,
            scaleY: 80f);

        private static readonly VoxelFbmParams JungleParameters = new(
            exponent: 1,
            scaleY: 10f,
            offsetY: -7);

        private static readonly VoxelFbmParams MoistureParameters = new(
            exponent: 1,
            scaleX: 0.002f,
            scaleY: 100f,
            scaleZ: 0.002f,
            seed1: 123.4f);

        private static readonly VoxelFbmParams TemperatureParameters = new(
            exponent: 1,
            scaleX: 0.002f,
            scaleY: 100f,
            scaleZ: 0.002f,
            seed1: 345.6f);

        public static VoxelColumnSample SampleColumn(int x, int z, int worldHeight, int seaLevel)
        {
            var moisture = SampleClimate(x, z, MoistureParameters);
            var temperature = SampleClimate(x, z, TemperatureParameters);
            var biome = ResolveBiome(moisture, temperature);

            var darkHeight = seaLevel + ScaleHeight(VoxelNoise.SealedFbm2D(x, z, DarkParameters), worldHeight);
            var desertHeight = seaLevel + ScaleHeight(VoxelNoise.SealedFbm2D(x, z, DesertParameters), worldHeight);
            var frozenHeight = seaLevel + ScaleHeight(VoxelNoise.SealedFbm2D(x, z, FrozenParameters), worldHeight);
            var jungleHeight = seaLevel + ScaleHeight(VoxelNoise.SealedFbm2D(x, z, JungleParameters), worldHeight);

            var lowBand = Mathf.RoundToInt(VoxelNoise.Mix(darkHeight, frozenHeight, moisture));
            var highBand = Mathf.RoundToInt(VoxelNoise.Mix(desertHeight, jungleHeight, moisture));
            var blended = Mathf.RoundToInt(VoxelNoise.Mix(lowBand, highBand, temperature));
            var top = Mathf.Clamp(blended, 1, worldHeight - 2);

            return new VoxelColumnSample(top, biome, moisture, temperature);
        }

        private static int ScaleHeight(int sourceHeight, int worldHeight)
        {
            // MiniMinecraft heights are based around 256 vertical cells and sea level 128.
            var normalized = sourceHeight / 128f;
            return Mathf.RoundToInt(normalized * Mathf.Max(1, worldHeight / 3f));
        }

        private static float SampleClimate(int x, int z, VoxelFbmParams parameters)
        {
            var value = VoxelNoise.SealedFbm2D(x, z, parameters);
            var normalized = (value / Mathf.Max(0.001f, parameters.ScaleY)) * 1.33f;
            return VoxelNoise.Clamp(normalized, 0f, 1f);
        }

        private static VoxelBiomeType ResolveBiome(float moisture, float temperature)
        {
            if (moisture > 0.58f && temperature > 0.58f)
            {
                return VoxelBiomeType.Jungle;
            }

            if (moisture > 0.45f && temperature > 0.5f)
            {
                return VoxelBiomeType.Plain;
            }

            if (moisture > 0.55f && temperature <= 0.45f)
            {
                return VoxelBiomeType.Frozen;
            }

            if (moisture > 0.5f && temperature <= 0.5f)
            {
                return VoxelBiomeType.Tundra;
            }

            if (moisture <= 0.4f && temperature <= 0.4f)
            {
                return VoxelBiomeType.Dark;
            }

            if (moisture <= 0.5f && temperature <= 0.5f)
            {
                return VoxelBiomeType.Mountain;
            }

            return VoxelBiomeType.Desert;
        }
    }
}
