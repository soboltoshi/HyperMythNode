using System.Collections.Generic;
using UnityEngine;

namespace LastExperiments.Voxel
{
    public class VoxelWorldRuntime : MonoBehaviour
    {
        [Header("World Shape")]
        [SerializeField] private int worldSizeX = 42;
        [SerializeField] private int worldSizeY = 16;
        [SerializeField] private int worldSizeZ = 42;
        [SerializeField] private float cellSizeMeters = 0.25f;
        [SerializeField] private Transform worldRoot;

        [Header("Generation")]
        [SerializeField] private bool generateOnStart = true;
        [SerializeField] private bool includeBiomeAssets = true;

        [Header("Lighting")]
        [SerializeField] private bool enableDayNightCycle = true;
        [SerializeField] private float dayLengthSeconds = 240f;
        [SerializeField] private Light dayNightLight;

        private readonly Dictionary<Vector3Int, GameObject> renderedBlocks = new();
        private readonly Dictionary<VoxelBlockType, Material> materialCache = new();
        private VoxelBlockType[,,] blocks;
        private Vector3 worldOffset;
        private float dayTimer;
        private int seaLevel;

        public Vector3Int WorldSize => new(worldSizeX, worldSizeY, worldSizeZ);
        public int SeaLevel => seaLevel;
        public VoxelBlockType[,,] Blocks => blocks;
        public Transform WorldRoot => worldRoot != null ? worldRoot : transform;

        public void AssignWorldRoot(Transform root)
        {
            if (root == null)
            {
                return;
            }

            worldRoot = root;
            ConfigureWorldOffset();
        }

        private void Awake()
        {
            EnsureWorldRoot();
            ConfigureWorldOffset();
            EnsureDayNightLight();
        }

        private void Start()
        {
            if (generateOnStart)
            {
                GenerateWorld();
            }
        }

        private void Update()
        {
            if (!enableDayNightCycle || dayNightLight == null || dayLengthSeconds <= 0.01f)
            {
                return;
            }

            dayTimer += Time.deltaTime;
            var t = Mathf.Repeat(dayTimer / dayLengthSeconds, 1f);
            var sunPitch = (t * 360f) - 90f;
            dayNightLight.transform.rotation = Quaternion.Euler(sunPitch, 35f, 0f);

            // Mirrors MiniMinecraft's long daytime and shorter transitions.
            if (t < 0.5f)
            {
                dayNightLight.intensity = Mathf.Lerp(0.8f, 1.2f, t / 0.5f);
                dayNightLight.color = Color.Lerp(new Color(1f, 0.95f, 0.82f), Color.white, t / 0.5f);
            }
            else if (t < 0.58f)
            {
                var dusk = (t - 0.5f) / 0.08f;
                dayNightLight.intensity = Mathf.Lerp(1.2f, 0.35f, dusk);
                dayNightLight.color = Color.Lerp(Color.white, new Color(1f, 0.55f, 0.35f), dusk);
            }
            else if (t < 0.92f)
            {
                var night = (t - 0.58f) / 0.34f;
                dayNightLight.intensity = Mathf.Lerp(0.35f, 0.22f, night);
                dayNightLight.color = Color.Lerp(new Color(0.42f, 0.55f, 0.92f), new Color(0.30f, 0.38f, 0.60f), night);
            }
            else
            {
                var dawn = (t - 0.92f) / 0.08f;
                dayNightLight.intensity = Mathf.Lerp(0.22f, 0.8f, dawn);
                dayNightLight.color = Color.Lerp(new Color(1f, 0.58f, 0.35f), new Color(1f, 0.95f, 0.82f), dawn);
            }
        }

        public void GenerateWorld()
        {
            worldSizeX = Mathf.Max(8, worldSizeX);
            worldSizeY = Mathf.Max(8, worldSizeY);
            worldSizeZ = Mathf.Max(8, worldSizeZ);

            seaLevel = Mathf.Clamp(worldSizeY / 2, 2, worldSizeY - 3);
            blocks = new VoxelBlockType[worldSizeX, worldSizeY, worldSizeZ];

            GenerateTerrainData();
            RefreshAllVisuals();
        }

        public bool InBounds(Vector3Int position)
        {
            return position.x >= 0 && position.x < worldSizeX
                   && position.y >= 0 && position.y < worldSizeY
                   && position.z >= 0 && position.z < worldSizeZ;
        }

        public bool TryGetBlock(Vector3Int position, out VoxelBlockType blockType)
        {
            if (blocks == null || !InBounds(position))
            {
                blockType = VoxelBlockType.Empty;
                return false;
            }

            blockType = blocks[position.x, position.y, position.z];
            return true;
        }

        public bool SetBlock(Vector3Int position, VoxelBlockType blockType)
        {
            if (blocks == null || !InBounds(position))
            {
                return false;
            }

            blocks[position.x, position.y, position.z] = blockType;
            RebuildAt(position);
            RebuildAt(position + Vector3Int.left);
            RebuildAt(position + Vector3Int.right);
            RebuildAt(position + Vector3Int.up);
            RebuildAt(position + Vector3Int.down);
            RebuildAt(position + new Vector3Int(0, 0, 1));
            RebuildAt(position + new Vector3Int(0, 0, -1));
            return true;
        }

        public bool TryRaycastGrid(Ray ray, float maxDistance, out Vector3Int hitGrid, out Vector3Int placeGrid)
        {
            hitGrid = default;
            placeGrid = default;

            if (!Physics.Raycast(ray, out var hitInfo, maxDistance))
            {
                return false;
            }

            var marker = hitInfo.collider.GetComponentInParent<VoxelBlockMarker>();
            if (marker == null)
            {
                return false;
            }

            hitGrid = marker.GridPosition;
            placeGrid = hitGrid + Vector3Int.RoundToInt(hitInfo.normal);
            return true;
        }

        public Vector3 GridToWorldCenter(Vector3Int gridPosition)
        {
            var local = GridToLocalCenter(gridPosition);
            return WorldRoot.TransformPoint(local);
        }

        public Vector3Int WorldToGrid(Vector3 worldPosition)
        {
            var local = WorldRoot.InverseTransformPoint(worldPosition);
            var x = Mathf.FloorToInt((local.x - worldOffset.x) / cellSizeMeters);
            var y = Mathf.FloorToInt(local.y / cellSizeMeters);
            var z = Mathf.FloorToInt((local.z - worldOffset.z) / cellSizeMeters);
            return new Vector3Int(x, y, z);
        }

        public string RenderAsciiSlice(int y)
        {
            return VoxelAsciiPalette.RenderSlice(blocks, y);
        }

        public int ApplyAsciiStructure(string[] lines, Vector3Int origin)
        {
            var placements = VoxelAsciiPalette.ParseStructure(lines, origin);
            var changed = 0;
            foreach (var placement in placements)
            {
                if (SetBlock(placement.position, placement.block))
                {
                    changed++;
                }
            }

            return changed;
        }

        private void GenerateTerrainData()
        {
            for (var x = 0; x < worldSizeX; x++)
            {
                for (var z = 0; z < worldSizeZ; z++)
                {
                    var sample = VoxelTerrainGenerator.SampleColumn(x, z, worldSizeY, seaLevel);
                    var top = sample.Top;
                    if (sample.Biome == VoxelBiomeType.Desert && top > seaLevel + 3)
                    {
                        top = (seaLevel + 3) + Mathf.RoundToInt((top - (seaLevel + 3)) * 0.3f);
                    }

                    FillColumn(x, z, top, sample.Biome);
                    if (includeBiomeAssets)
                    {
                        PlaceBiomeAssets(x, z, top, sample.Biome);
                    }
                }
            }
        }

        private void FillColumn(int x, int z, int top, VoxelBiomeType biome)
        {
            top = Mathf.Clamp(top, 1, worldSizeY - 2);
            for (var y = 0; y < worldSizeY; y++)
            {
                var type = VoxelBlockType.Empty;
                if (y == 0)
                {
                    type = VoxelBlockType.Bedrock;
                }
                else if (y <= seaLevel && y < top)
                {
                    type = VoxelBlockType.Stone;
                }
                else if (y <= seaLevel && y == top)
                {
                    type = VoxelBlockType.Bedrock;
                }
                else if (y <= seaLevel)
                {
                    type = biome is VoxelBiomeType.Frozen or VoxelBiomeType.Tundra or VoxelBiomeType.Dark or VoxelBiomeType.Mountain
                        ? VoxelBlockType.Ice
                        : VoxelBlockType.Water;
                }
                else if (y < top)
                {
                    type = biome switch
                    {
                        VoxelBiomeType.Plain => VoxelBlockType.Dirt,
                        VoxelBiomeType.Tundra => VoxelBlockType.Dirt,
                        VoxelBiomeType.Frozen => VoxelBlockType.Dirt,
                        VoxelBiomeType.Dark => VoxelBlockType.Evil,
                        VoxelBiomeType.Desert => VoxelBlockType.Sand,
                        VoxelBiomeType.Jungle => VoxelBlockType.LeafMold,
                        VoxelBiomeType.Mountain => VoxelBlockType.Stone,
                        _ => VoxelBlockType.Dirt
                    };
                }
                else if (y == top)
                {
                    type = biome switch
                    {
                        VoxelBiomeType.Plain => VoxelBlockType.Grass,
                        VoxelBiomeType.Dark => VoxelBlockType.Evil,
                        VoxelBiomeType.Desert => VoxelBlockType.Sand,
                        VoxelBiomeType.Frozen => VoxelBlockType.Snow,
                        VoxelBiomeType.Jungle => VoxelBlockType.LeafMold,
                        VoxelBiomeType.Tundra => VoxelBlockType.FrozeDirt,
                        VoxelBiomeType.Mountain => VoxelBlockType.Stone,
                        _ => VoxelBlockType.Grass
                    };
                }

                blocks[x, y, z] = type;
            }
        }

        private void PlaceBiomeAssets(int x, int z, int top, VoxelBiomeType biome)
        {
            if (top <= 0 || top >= worldSizeY - 2)
            {
                return;
            }

            var seed = VoxelNoise.Rand2D(x % 1024, z % 1024, 123.4f, 345.6f, 456.7f) * 111f;
            var random = VoxelNoise.Rand1D(seed);

            switch (biome)
            {
                case VoxelBiomeType.Plain:
                    if (blocks[x, top, z] == VoxelBlockType.Grass)
                    {
                        if (random > 0.95f)
                        {
                            SetIfInBounds(new Vector3Int(x, top + 1, z), VoxelBlockType.Mushroom);
                        }
                        else if (random > 0.9f)
                        {
                            SetIfInBounds(new Vector3Int(x, top + 1, z), VoxelBlockType.RedFlower);
                        }
                        else if (random > 0.6f)
                        {
                            SetIfInBounds(new Vector3Int(x, top + 1, z), VoxelBlockType.CrossGrass);
                        }
                    }
                    break;
                case VoxelBiomeType.Dark:
                    if (top > seaLevel + 2 && random > 0.82f)
                    {
                        var end = Mathf.Max(seaLevel, top - Mathf.RoundToInt((top - seaLevel) * random));
                        for (var y = top; y >= end; y--)
                        {
                            SetIfInBounds(new Vector3Int(x, y, z), VoxelBlockType.Lava);
                        }
                    }
                    break;
                case VoxelBiomeType.Desert:
                    if (top > seaLevel + 1)
                    {
                        SetIfInBounds(new Vector3Int(x, top + 1, z), VoxelBlockType.OrangeRock);
                        if (random > 0.55f)
                        {
                            SetIfInBounds(new Vector3Int(x, top + 2, z), VoxelBlockType.RedRock);
                        }
                    }
                    break;
                case VoxelBiomeType.Frozen:
                    if (top > seaLevel - 1 && top < worldSizeY - 3 && random > 0.72f)
                    {
                        SetIfInBounds(new Vector3Int(x, top + 1, z), VoxelBlockType.Ice);
                    }
                    break;
                case VoxelBiomeType.Jungle:
                    if (top > seaLevel && random > 0.92f
                        && x > 1 && x < worldSizeX - 2
                        && z > 1 && z < worldSizeZ - 2
                        && blocks[x, top, z] == VoxelBlockType.LeafMold)
                    {
                        var trunkHeight = 2 + Mathf.RoundToInt(5f * VoxelNoise.Rand1D(seed + 12.3f));
                        for (var y = top + 1; y < top + trunkHeight && y < worldSizeY - 1; y++)
                        {
                            SetIfInBounds(new Vector3Int(x, y, z), VoxelBlockType.Wood);
                        }

                        var leafType = VoxelNoise.Rand1D(seed + 23.4f) > 0.3f
                            ? VoxelBlockType.Leaf
                            : VoxelBlockType.LeafMold;

                        PlaceLeafLayer(x, top + trunkHeight, z, 1, leafType);
                        PlaceLeafLayer(x, top + trunkHeight + 1, z, 2, leafType);
                        PlaceLeafLayer(x, top + trunkHeight + 2, z, 1, leafType);
                    }
                    break;
                case VoxelBiomeType.Tundra:
                    if (blocks[x, top, z] == VoxelBlockType.FrozeDirt)
                    {
                        if (random > 0.98f)
                        {
                            SetIfInBounds(new Vector3Int(x, top + 1, z), VoxelBlockType.Bush);
                        }
                        else if (random > 0.96f)
                        {
                            SetIfInBounds(new Vector3Int(x, top + 1, z), VoxelBlockType.DeadBranch);
                        }
                        else if (random > 0.9f)
                        {
                            SetIfInBounds(new Vector3Int(x, top + 1, z), VoxelBlockType.GreyMushroom);
                        }
                    }
                    break;
                case VoxelBiomeType.Mountain:
                    if (top > seaLevel + 1)
                    {
                        if (random > 0.78f)
                        {
                            SetIfInBounds(new Vector3Int(x, Mathf.Max(seaLevel - 1, top - 2), z), VoxelBlockType.Coal);
                        }

                        if (random > 0.88f)
                        {
                            SetIfInBounds(new Vector3Int(x, top - 1, z), VoxelBlockType.Gold);
                        }

                        if (random > 0.94f)
                        {
                            SetIfInBounds(new Vector3Int(x, top, z), VoxelBlockType.Ruby);
                        }
                    }
                    break;
            }
        }

        private void PlaceLeafLayer(int centerX, int y, int centerZ, int radius, VoxelBlockType leafType)
        {
            if (y < 0 || y >= worldSizeY)
            {
                return;
            }

            for (var x = centerX - radius; x <= centerX + radius; x++)
            {
                for (var z = centerZ - radius; z <= centerZ + radius; z++)
                {
                    SetIfInBounds(new Vector3Int(x, y, z), leafType);
                }
            }
        }

        private void SetIfInBounds(Vector3Int position, VoxelBlockType type)
        {
            if (!InBounds(position))
            {
                return;
            }

            blocks[position.x, position.y, position.z] = type;
        }

        private void EnsureWorldRoot()
        {
            if (worldRoot != null)
            {
                return;
            }

            var root = new GameObject("VoxelWorldRoot");
            root.transform.SetParent(transform, false);
            worldRoot = root.transform;
        }

        private void ConfigureWorldOffset()
        {
            worldOffset = new Vector3(
                -(worldSizeX * cellSizeMeters) * 0.5f,
                0f,
                -(worldSizeZ * cellSizeMeters) * 0.5f);
        }

        private void EnsureDayNightLight()
        {
            if (dayNightLight != null)
            {
                return;
            }

            dayNightLight = FindFirstObjectByType<Light>();
            if (dayNightLight == null)
            {
                var lightObject = new GameObject("VoxelSun");
                dayNightLight = lightObject.AddComponent<Light>();
                dayNightLight.type = LightType.Directional;
                dayNightLight.intensity = 1f;
            }
        }

        private void RefreshAllVisuals()
        {
            foreach (var entry in renderedBlocks)
            {
                if (entry.Value != null)
                {
                    Destroy(entry.Value);
                }
            }

            renderedBlocks.Clear();

            if (blocks == null)
            {
                return;
            }

            for (var x = 0; x < worldSizeX; x++)
            {
                for (var y = 0; y < worldSizeY; y++)
                {
                    for (var z = 0; z < worldSizeZ; z++)
                    {
                        var position = new Vector3Int(x, y, z);
                        if (ShouldRender(position))
                        {
                            CreateVisual(position);
                        }
                    }
                }
            }
        }

        private void RebuildAt(Vector3Int position)
        {
            if (!InBounds(position))
            {
                return;
            }

            if (renderedBlocks.TryGetValue(position, out var existing) && existing != null)
            {
                Destroy(existing);
            }

            renderedBlocks.Remove(position);

            if (ShouldRender(position))
            {
                CreateVisual(position);
            }
        }

        private bool ShouldRender(Vector3Int position)
        {
            if (blocks == null || !InBounds(position))
            {
                return false;
            }

            var type = blocks[position.x, position.y, position.z];
            if (type == VoxelBlockType.Empty)
            {
                return false;
            }

            if (VoxelBlockRules.IsCrossType(type))
            {
                return true;
            }

            return IsExposed(position);
        }

        private bool IsExposed(Vector3Int position)
        {
            var current = blocks[position.x, position.y, position.z];
            var neighbors = new[]
            {
                position + Vector3Int.left,
                position + Vector3Int.right,
                position + Vector3Int.up,
                position + Vector3Int.down,
                position + new Vector3Int(0, 0, -1),
                position + new Vector3Int(0, 0, 1)
            };

            foreach (var neighbor in neighbors)
            {
                if (!InBounds(neighbor))
                {
                    return true;
                }

                var other = blocks[neighbor.x, neighbor.y, neighbor.z];
                if (other == VoxelBlockType.Empty)
                {
                    return true;
                }

                if (VoxelBlockRules.IsTransparent(other) && other != current)
                {
                    return true;
                }
            }

            return false;
        }

        private void CreateVisual(Vector3Int position)
        {
            var type = blocks[position.x, position.y, position.z];
            if (type == VoxelBlockType.Empty)
            {
                return;
            }

            GameObject view;
            if (VoxelBlockRules.IsCrossType(type))
            {
                view = CreateCrossVisual(position, type);
            }
            else
            {
                view = GameObject.CreatePrimitive(PrimitiveType.Cube);
                view.transform.SetParent(WorldRoot, false);
                view.transform.localPosition = GridToLocalCenter(position);
                view.transform.localScale = Vector3.one * cellSizeMeters;

                var renderer = view.GetComponent<Renderer>();
                renderer.sharedMaterial = ResolveMaterial(type);

                if (!VoxelBlockRules.IsCollidable(type))
                {
                    var collider = view.GetComponent<Collider>();
                    if (collider != null)
                    {
                        Destroy(collider);
                    }
                }
            }

            view.name = $"Voxel_{type}_{position.x}_{position.y}_{position.z}";
            var marker = view.GetComponent<VoxelBlockMarker>();
            if (marker == null)
            {
                marker = view.AddComponent<VoxelBlockMarker>();
            }

            marker.Set(position, type);
            renderedBlocks[position] = view;
        }

        private GameObject CreateCrossVisual(Vector3Int position, VoxelBlockType type)
        {
            var root = new GameObject();
            root.transform.SetParent(WorldRoot, false);
            root.transform.localPosition = GridToLocalCenter(position);
            root.transform.localScale = Vector3.one * cellSizeMeters;

            var quadA = GameObject.CreatePrimitive(PrimitiveType.Quad);
            quadA.transform.SetParent(root.transform, false);
            quadA.transform.localRotation = Quaternion.Euler(0f, 45f, 0f);
            quadA.transform.localScale = Vector3.one;
            ApplyVisualMaterial(quadA, type, false);

            var quadB = GameObject.CreatePrimitive(PrimitiveType.Quad);
            quadB.transform.SetParent(root.transform, false);
            quadB.transform.localRotation = Quaternion.Euler(0f, -45f, 0f);
            quadB.transform.localScale = Vector3.one;
            ApplyVisualMaterial(quadB, type, false);

            var colliderA = quadA.GetComponent<Collider>();
            if (colliderA != null)
            {
                Destroy(colliderA);
            }

            var colliderB = quadB.GetComponent<Collider>();
            if (colliderB != null)
            {
                Destroy(colliderB);
            }

            return root;
        }

        private void ApplyVisualMaterial(GameObject visual, VoxelBlockType type, bool collidable)
        {
            var renderer = visual.GetComponent<Renderer>();
            renderer.sharedMaterial = ResolveMaterial(type);
            if (!collidable)
            {
                var collider = visual.GetComponent<Collider>();
                if (collider != null)
                {
                    Destroy(collider);
                }
            }
        }

        private Vector3 GridToLocalCenter(Vector3Int gridPosition)
        {
            return new Vector3(
                worldOffset.x + ((gridPosition.x + 0.5f) * cellSizeMeters),
                (gridPosition.y + 0.5f) * cellSizeMeters,
                worldOffset.z + ((gridPosition.z + 0.5f) * cellSizeMeters));
        }

        private Material ResolveMaterial(VoxelBlockType blockType)
        {
            if (materialCache.TryGetValue(blockType, out var material))
            {
                return material;
            }

            var shader = Shader.Find("Standard");
            if (shader == null)
            {
                shader = Shader.Find("Universal Render Pipeline/Lit");
            }
            if (shader == null)
            {
                shader = Shader.Find("Unlit/Color");
            }

            material = new Material(shader)
            {
                color = VoxelBlockRules.GetColor(blockType)
            };

            if (VoxelBlockRules.IsTransparent(blockType))
            {
                ConfigureTransparentMaterial(material);
            }

            materialCache[blockType] = material;
            return material;
        }

        private static void ConfigureTransparentMaterial(Material material)
        {
            if (!material.HasProperty("_Mode"))
            {
                return;
            }

            material.SetFloat("_Mode", 3f);
            material.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.SrcAlpha);
            material.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
            material.SetInt("_ZWrite", 0);
            material.DisableKeyword("_ALPHATEST_ON");
            material.EnableKeyword("_ALPHABLEND_ON");
            material.DisableKeyword("_ALPHAPREMULTIPLY_ON");
            material.renderQueue = (int)UnityEngine.Rendering.RenderQueue.Transparent;
        }
    }
}
