using System;
using UnityEngine;

namespace LastExperiments.Voxel
{
    [Serializable]
    public class GameOfLifeGenerationOptions
    {
        public int width = 42;
        public int height = 42;
        public int depth = 42;
        public int steps = 7;
        public float seedDensity = 0.22f;
        public int randomSeed = 424242;
    }

    [Serializable]
    public struct GameOfLifeGenerationResult
    {
        public int width;
        public int height;
        public int depth;
        public int steps;
        public int randomSeed;
        public int aliveCells;
        public int voxelizedCells;
        public string rule;
    }

    /// <summary>
    /// Unity-side adapter for the upstream Game-of-Life reference.
    /// Runs a 3D cellular automaton and projects the result into the local voxel world.
    /// </summary>
    public class GameOfLifeVoxelAdapter : MonoBehaviour
    {
        private const string RuleName = "B6/S5-7 (3D Moore neighborhood)";
        private static readonly Vector3Int[] NeighborOffsets = BuildNeighborOffsets();

        [Header("Adapter Defaults")]
        [SerializeField] private bool force42Cube = true;
        [SerializeField] private int defaultSteps = 7;
        [SerializeField] [Range(0.05f, 0.85f)] private float defaultSeedDensity = 0.22f;

        [Header("Block Mapping")]
        [SerializeField] private VoxelBlockType subterraneanBlock = VoxelBlockType.Stone;
        [SerializeField] private VoxelBlockType surfaceBlock = VoxelBlockType.Grass;
        [SerializeField] private VoxelBlockType skyBlock = VoxelBlockType.Leaf;
        [SerializeField] private bool verboseLogs = true;

        public GameOfLifeGenerationResult GenerateIntoWorld(VoxelWorldRuntime worldRuntime, GameOfLifeGenerationOptions options = null)
        {
            if (worldRuntime == null)
            {
                return default;
            }

            options ??= BuildDefaults();

            var width = force42Cube ? 42 : Mathf.Max(8, options.width);
            var height = force42Cube ? 42 : Mathf.Max(8, options.height);
            var depth = force42Cube ? 42 : Mathf.Max(8, options.depth);
            var steps = Mathf.Clamp(options.steps, 1, 48);
            var density = Mathf.Clamp(options.seedDensity, 0.05f, 0.85f);
            var seed = options.randomSeed == 0 ? Environment.TickCount : options.randomSeed;

            worldRuntime.ConfigureWorldShape(width, height, depth, regenerate: true);
            var seaLevel = Mathf.Clamp(height / 2, 2, height - 3);

            var baseline = CloneBlocks(worldRuntime.Blocks);
            var current = SeedAutomaton(width, height, depth, density, seed, seaLevel);
            var next = new bool[width, height, depth];

            for (var i = 0; i < steps; i++)
            {
                Step(current, next, width, height, depth);
                Swap(ref current, ref next);
            }

            var aliveCells = 0;
            var voxelizedCells = 0;
            var rng = new System.Random(seed ^ 0x46F56A);
            for (var x = 0; x < width; x++)
            {
                for (var y = 0; y < height; y++)
                {
                    for (var z = 0; z < depth; z++)
                    {
                        if (y == 0)
                        {
                            baseline[x, y, z] = VoxelBlockType.Bedrock;
                            voxelizedCells++;
                            continue;
                        }

                        if (current[x, y, z])
                        {
                            aliveCells++;
                            var block = SelectLifeBlock(y, seaLevel, rng.NextDouble());
                            baseline[x, y, z] = block;
                            voxelizedCells++;
                            continue;
                        }

                        // Keep ocean pressure and underground solidity for Minecraft-like readability.
                        if (y <= seaLevel && baseline[x, y, z] == VoxelBlockType.Empty)
                        {
                            baseline[x, y, z] = VoxelBlockType.Water;
                            voxelizedCells++;
                            continue;
                        }

                        if (y > seaLevel && rng.NextDouble() > 0.63d)
                        {
                            baseline[x, y, z] = VoxelBlockType.Empty;
                            continue;
                        }

                        if (baseline[x, y, z] != VoxelBlockType.Empty)
                        {
                            voxelizedCells++;
                        }
                    }
                }
            }

            worldRuntime.ApplyGeneratedBlocks(baseline, seaLevel);

            var result = new GameOfLifeGenerationResult
            {
                width = width,
                height = height,
                depth = depth,
                steps = steps,
                randomSeed = seed,
                aliveCells = aliveCells,
                voxelizedCells = voxelizedCells,
                rule = RuleName,
            };

            if (verboseLogs)
            {
                Debug.Log(
                    $"GameOfLifeVoxelAdapter generated {width}x{height}x{depth}, " +
                    $"steps={steps}, seed={seed}, alive={aliveCells}, voxelized={voxelizedCells}.");
            }

            return result;
        }

        public int DeriveSeedFromRequest(string request, int fallbackSeed = 424242)
        {
            if (string.IsNullOrWhiteSpace(request))
            {
                return fallbackSeed;
            }

            unchecked
            {
                uint hash = 2166136261u;
                foreach (var ch in request.Trim().ToLowerInvariant())
                {
                    hash ^= ch;
                    hash *= 16777619u;
                }

                return (int)(hash & 0x7fffffffu);
            }
        }

        private GameOfLifeGenerationOptions BuildDefaults()
        {
            return new GameOfLifeGenerationOptions
            {
                width = 42,
                height = force42Cube ? 42 : 16,
                depth = 42,
                steps = defaultSteps,
                seedDensity = defaultSeedDensity,
                randomSeed = Environment.TickCount,
            };
        }

        private VoxelBlockType SelectLifeBlock(int y, int seaLevel, double roll)
        {
            if (y <= seaLevel - 3)
            {
                return roll > 0.93d ? VoxelBlockType.Coal : subterraneanBlock;
            }

            if (y <= seaLevel + 1)
            {
                if (roll > 0.95d)
                {
                    return VoxelBlockType.Gold;
                }

                return surfaceBlock;
            }

            return roll > 0.9d ? VoxelBlockType.CrossGrass : skyBlock;
        }

        private static bool[,,] SeedAutomaton(int width, int height, int depth, float density, int seed, int seaLevel)
        {
            var grid = new bool[width, height, depth];
            var random = new System.Random(seed);
            for (var x = 1; x < width - 1; x++)
            {
                for (var y = 1; y < height - 1; y++)
                {
                    for (var z = 1; z < depth - 1; z++)
                    {
                        var humidityBias = y <= seaLevel ? 0.05f : -0.03f;
                        var threshold = Mathf.Clamp01(density + humidityBias);
                        grid[x, y, z] = random.NextDouble() < threshold;
                    }
                }
            }

            return grid;
        }

        private static void Step(bool[,,] current, bool[,,] next, int width, int height, int depth)
        {
            for (var x = 0; x < width; x++)
            {
                for (var y = 0; y < height; y++)
                {
                    for (var z = 0; z < depth; z++)
                    {
                        var neighbors = CountNeighbors(current, x, y, z, width, height, depth);
                        var alive = current[x, y, z];
                        var survives = alive && neighbors >= 5 && neighbors <= 7;
                        var births = !alive && neighbors == 6;
                        next[x, y, z] = survives || births;
                    }
                }
            }
        }

        private static int CountNeighbors(bool[,,] grid, int x, int y, int z, int width, int height, int depth)
        {
            var alive = 0;
            for (var i = 0; i < NeighborOffsets.Length; i++)
            {
                var offset = NeighborOffsets[i];
                var nx = x + offset.x;
                var ny = y + offset.y;
                var nz = z + offset.z;
                if (nx < 0 || ny < 0 || nz < 0 || nx >= width || ny >= height || nz >= depth)
                {
                    continue;
                }

                if (grid[nx, ny, nz])
                {
                    alive++;
                }
            }

            return alive;
        }

        private static Vector3Int[] BuildNeighborOffsets()
        {
            var offsets = new Vector3Int[26];
            var index = 0;
            for (var x = -1; x <= 1; x++)
            {
                for (var y = -1; y <= 1; y++)
                {
                    for (var z = -1; z <= 1; z++)
                    {
                        if (x == 0 && y == 0 && z == 0)
                        {
                            continue;
                        }

                        offsets[index++] = new Vector3Int(x, y, z);
                    }
                }
            }

            return offsets;
        }

        private static VoxelBlockType[,,] CloneBlocks(VoxelBlockType[,,] source)
        {
            if (source == null)
            {
                return null;
            }

            var width = source.GetLength(0);
            var height = source.GetLength(1);
            var depth = source.GetLength(2);
            var clone = new VoxelBlockType[width, height, depth];

            for (var x = 0; x < width; x++)
            {
                for (var y = 0; y < height; y++)
                {
                    for (var z = 0; z < depth; z++)
                    {
                        clone[x, y, z] = source[x, y, z];
                    }
                }
            }

            return clone;
        }

        private static void Swap(ref bool[,,] first, ref bool[,,] second)
        {
            var tmp = first;
            first = second;
            second = tmp;
        }
    }
}
