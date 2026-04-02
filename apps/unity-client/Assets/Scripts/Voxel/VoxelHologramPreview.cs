using UnityEngine;

namespace LastExperiments.Voxel
{
    public class VoxelHologramPreview : MonoBehaviour
    {
        [SerializeField] private VoxelWorldRuntime worldRuntime;
        [SerializeField] private GameObject previewObject;
        [SerializeField] private Color previewColor = new(0.3f, 0.95f, 0.9f, 0.36f);

        public void Initialize(VoxelWorldRuntime runtime)
        {
            worldRuntime = runtime;
            EnsurePreviewObject();
            Hide();
        }

        public void Show(Vector3Int gridPosition, VoxelBlockType blockType)
        {
            if (worldRuntime == null || previewObject == null)
            {
                return;
            }

            if (!worldRuntime.InBounds(gridPosition))
            {
                Hide();
                return;
            }

            previewObject.SetActive(true);
            previewObject.transform.position = worldRuntime.GridToWorldCenter(gridPosition);

            var renderer = previewObject.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.material.color = Color.Lerp(previewColor, VoxelBlockRules.GetColor(blockType), 0.65f);
            }
        }

        public void Hide()
        {
            if (previewObject != null)
            {
                previewObject.SetActive(false);
            }
        }

        private void Awake()
        {
            if (worldRuntime == null)
            {
                worldRuntime = GetComponent<VoxelWorldRuntime>();
            }
            EnsurePreviewObject();
        }

        private void EnsurePreviewObject()
        {
            if (previewObject != null)
            {
                return;
            }

            previewObject = GameObject.CreatePrimitive(PrimitiveType.Cube);
            previewObject.name = "VoxelHologramPreview";
            previewObject.transform.SetParent(transform, false);

            var renderer = previewObject.GetComponent<Renderer>();
            var shader = Shader.Find("Standard") ?? Shader.Find("Unlit/Color");
            renderer.material = new Material(shader);
            renderer.material.color = previewColor;

            var collider = previewObject.GetComponent<Collider>();
            if (collider != null)
            {
                Destroy(collider);
            }

            var material = renderer.material;
            if (material.HasProperty("_Mode"))
            {
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
}
