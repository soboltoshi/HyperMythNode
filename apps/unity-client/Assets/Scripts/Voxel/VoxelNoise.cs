using UnityEngine;

namespace LastExperiments.Voxel
{
    public readonly struct VoxelFbmParams
    {
        public readonly float Persistence;
        public readonly int Octaves;
        public readonly int Exponent;
        public readonly float ScaleX;
        public readonly float ScaleY;
        public readonly float ScaleZ;
        public readonly int OffsetX;
        public readonly int OffsetY;
        public readonly int OffsetZ;
        public readonly float Seed1;
        public readonly float Seed2;
        public readonly float Seed3;

        public VoxelFbmParams(
            float persistence = 0.5f,
            int octaves = 8,
            int exponent = 4,
            float scaleX = 0.02f,
            float scaleY = 30f,
            float scaleZ = 0.02f,
            int offsetX = 0,
            int offsetY = 0,
            int offsetZ = 0,
            float seed1 = 12.9898f,
            float seed2 = 4.1414f,
            float seed3 = 43858.5453f)
        {
            Persistence = persistence;
            Octaves = octaves;
            Exponent = exponent;
            ScaleX = scaleX;
            ScaleY = scaleY;
            ScaleZ = scaleZ;
            OffsetX = offsetX;
            OffsetY = offsetY;
            OffsetZ = offsetZ;
            Seed1 = seed1;
            Seed2 = seed2;
            Seed3 = seed3;
        }
    }

    public static class VoxelNoise
    {
        public static float Fract(float value)
        {
            return value - Mathf.Floor(value);
        }

        public static float Clamp(float value, float min, float max)
        {
            return Mathf.Clamp(value, min, max);
        }

        public static float Mix(float a, float b, float t)
        {
            return Mathf.Lerp(a, b, t);
        }

        public static float MixCubic(float a, float b, float t)
        {
            var smooth = t * t * (3f - (2f * t));
            return Mix(a, b, smooth);
        }

        public static float Dot2D(float ax, float ay, float bx, float by)
        {
            return (ax * bx) + (ay * by);
        }

        public static float Rand2D(float x, float y, float seed1, float seed2, float seed3)
        {
            return Fract(Mathf.Sin(Dot2D(x, y, seed1, seed2)) * seed3);
        }

        public static float Rand1D(float seed)
        {
            return Rand2D(seed, seed + 123.4f, seed + 345.6f, seed + 678.9f, seed + 987.6f);
        }

        public static float InterpRand2D(float x, float y, float seed1, float seed2, float seed3)
        {
            var intX = Mathf.Floor(x);
            var fractX = Fract(x);
            var intY = Mathf.Floor(y);
            var fractY = Fract(y);

            var v1 = Rand2D(intX, intY, seed1, seed2, seed3);
            var v2 = Rand2D(intX + 1f, intY, seed1, seed2, seed3);
            var v3 = Rand2D(intX, intY + 1f, seed1, seed2, seed3);
            var v4 = Rand2D(intX + 1f, intY + 1f, seed1, seed2, seed3);

            var i1 = MixCubic(v1, v2, fractX);
            var i2 = MixCubic(v3, v4, fractX);
            return MixCubic(i1, i2, fractY);
        }

        public static float Fbm2D(float x, float y, float persistence, int octaves, float seed1, float seed2, float seed3)
        {
            var total = 0f;
            var frequency = 1f;
            var amplitude = 1f;

            for (var i = 0; i < octaves; i++)
            {
                frequency *= 2f;
                amplitude *= persistence;
                total += InterpRand2D(x * frequency, y * frequency, seed1, seed2, seed3) * amplitude;
            }

            return total;
        }

        public static int SealedFbm2D(int x, int z, VoxelFbmParams parameters)
        {
            var height = Fbm2D(
                (x + parameters.OffsetX) * parameters.ScaleX,
                (z + parameters.OffsetZ) * parameters.ScaleZ,
                parameters.Persistence,
                parameters.Octaves,
                parameters.Seed1,
                parameters.Seed2,
                parameters.Seed3);

            var exponent = Mathf.Max(1, parameters.Exponent);
            var powered = Mathf.Pow(height, exponent);
            return parameters.OffsetY + Mathf.RoundToInt(parameters.ScaleY * powered);
        }
    }
}
