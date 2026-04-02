using System.Collections.Generic;
using UnityEngine;

namespace LastExperiments.World
{
    public class WorldBoundsRenderer : MonoBehaviour
    {
        [SerializeField] private float edgeThickness = 0.025f;
        [SerializeField] private Color edgeColor = new(0.56f, 0.9f, 0.79f, 0.95f);

        private readonly List<GameObject> edgeObjects = new();
        private Material runtimeMaterial;

        public void RenderBounds(int[] worldBounds, float cellSizeMeters, Transform parentOverride = null)
        {
            if (worldBounds == null || worldBounds.Length < 3)
            {
                Debug.LogWarning("WorldBoundsRenderer received an invalid world_bounds payload.");
                return;
            }

            ClearEdges();

            var frameRoot = parentOverride != null ? parentOverride : transform;
            var size = new Vector3(
                worldBounds[0] * cellSizeMeters,
                worldBounds[2] * cellSizeMeters,
                worldBounds[1] * cellSizeMeters);
            var center = new Vector3(0f, size.y * 0.5f, 0f);
            var half = size * 0.5f;

            var material = ResolveMaterial();

            CreateEdge("Edge-Top-Front", center + new Vector3(0f, half.y, half.z), new Vector3(size.x, edgeThickness, edgeThickness), frameRoot, material);
            CreateEdge("Edge-Top-Back", center + new Vector3(0f, half.y, -half.z), new Vector3(size.x, edgeThickness, edgeThickness), frameRoot, material);
            CreateEdge("Edge-Bottom-Front", center + new Vector3(0f, -half.y, half.z), new Vector3(size.x, edgeThickness, edgeThickness), frameRoot, material);
            CreateEdge("Edge-Bottom-Back", center + new Vector3(0f, -half.y, -half.z), new Vector3(size.x, edgeThickness, edgeThickness), frameRoot, material);

            CreateEdge("Edge-Top-Left", center + new Vector3(-half.x, half.y, 0f), new Vector3(edgeThickness, edgeThickness, size.z), frameRoot, material);
            CreateEdge("Edge-Top-Right", center + new Vector3(half.x, half.y, 0f), new Vector3(edgeThickness, edgeThickness, size.z), frameRoot, material);
            CreateEdge("Edge-Bottom-Left", center + new Vector3(-half.x, -half.y, 0f), new Vector3(edgeThickness, edgeThickness, size.z), frameRoot, material);
            CreateEdge("Edge-Bottom-Right", center + new Vector3(half.x, -half.y, 0f), new Vector3(edgeThickness, edgeThickness, size.z), frameRoot, material);

            CreateEdge("Edge-Front-Left", center + new Vector3(-half.x, 0f, half.z), new Vector3(edgeThickness, size.y, edgeThickness), frameRoot, material);
            CreateEdge("Edge-Front-Right", center + new Vector3(half.x, 0f, half.z), new Vector3(edgeThickness, size.y, edgeThickness), frameRoot, material);
            CreateEdge("Edge-Back-Left", center + new Vector3(-half.x, 0f, -half.z), new Vector3(edgeThickness, size.y, edgeThickness), frameRoot, material);
            CreateEdge("Edge-Back-Right", center + new Vector3(half.x, 0f, -half.z), new Vector3(edgeThickness, size.y, edgeThickness), frameRoot, material);

            Debug.Log($"Rendered {worldBounds[0]} x {worldBounds[1]} x {worldBounds[2]} bounds at {cellSizeMeters:0.###}m per cell.");
        }

        private void CreateEdge(string edgeName, Vector3 localPosition, Vector3 localScale, Transform parent, Material material)
        {
            var edge = GameObject.CreatePrimitive(PrimitiveType.Cube);
            edge.name = edgeName;
            edge.transform.SetParent(parent, false);
            edge.transform.localPosition = localPosition;
            edge.transform.localScale = localScale;

            var collider = edge.GetComponent<Collider>();
            if (collider != null)
            {
                Destroy(collider);
            }

            var renderer = edge.GetComponent<Renderer>();
            renderer.sharedMaterial = material;

            edgeObjects.Add(edge);
        }

        private Material ResolveMaterial()
        {
            if (runtimeMaterial != null)
            {
                return runtimeMaterial;
            }

            var shader = Shader.Find("Unlit/Color");
            if (shader == null)
            {
                shader = Shader.Find("Standard");
            }

            runtimeMaterial = new Material(shader);
            runtimeMaterial.color = edgeColor;
            return runtimeMaterial;
        }

        private void ClearEdges()
        {
            foreach (var edge in edgeObjects)
            {
                if (edge != null)
                {
                    Destroy(edge);
                }
            }

            edgeObjects.Clear();
        }
    }
}
