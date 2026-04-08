using UnityEngine;

namespace LastExperiments.Voxel
{
    public class VoxelWristMenu : MonoBehaviour
    {
        [SerializeField] private Transform wristAnchor;
        [SerializeField] private Transform headAnchor;
        [SerializeField] private VoxelCreatorController creator;
        [SerializeField] private bool visible = true;
        [SerializeField] private TextMesh textMesh;
        [SerializeField] private string transientPrompt = "";
        [SerializeField] private float transientPromptUntil = -1f;

        public bool Visible => visible;

        private void Awake()
        {
            EnsureVisual();
        }

        private void LateUpdate()
        {
            if (transientPromptUntil > 0f && transientPromptUntil <= Time.time && !string.IsNullOrWhiteSpace(transientPrompt))
            {
                transientPrompt = "";
                transientPromptUntil = -1f;
                RefreshText();
            }

            if (textMesh == null || wristAnchor == null || !visible)
            {
                return;
            }

            transform.position = wristAnchor.position + (wristAnchor.up * 0.08f) + (wristAnchor.forward * 0.04f);
            transform.rotation = headAnchor != null
                ? Quaternion.LookRotation(transform.position - headAnchor.position, Vector3.up)
                : wristAnchor.rotation;
        }

        public void Initialize(Transform wrist, Transform head, VoxelCreatorController creatorController)
        {
            wristAnchor = wrist;
            headAnchor = head;
            creator = creatorController;
            creator.SelectionChanged += _ => RefreshText();
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

        public void ShowPrompt(string message, float seconds = 6f)
        {
            transientPrompt = message ?? "";
            transientPromptUntil = Time.time + Mathf.Max(0.5f, seconds);
            RefreshText();
        }

        public void ClearPrompt()
        {
            transientPrompt = "";
            transientPromptUntil = -1f;
            RefreshText();
        }

        public void RefreshText()
        {
            if (textMesh == null)
            {
                return;
            }

            var hasPrompt = transientPromptUntil > Time.time && !string.IsNullOrWhiteSpace(transientPrompt);

            var selection = creator != null ? creator.GetSelectionSummary() : "none";
            textMesh.text =
                "Wrist Menu\n" +
                $"Select: {selection}\n" +
                "L-Grip: voice capture\n" +
                "R-Primary: cycle block\n" +
                "R-Trigger: place block\n" +
                "R-Grip: remove block" +
                (hasPrompt ? $"\n\n{transientPrompt}" : "");
        }

        private void EnsureVisual()
        {
            if (textMesh != null)
            {
                return;
            }

            var panel = new GameObject("WristMenuText");
            panel.transform.SetParent(transform, false);
            textMesh = panel.AddComponent<TextMesh>();
            textMesh.anchor = TextAnchor.MiddleCenter;
            textMesh.alignment = TextAlignment.Center;
            textMesh.characterSize = 0.02f;
            textMesh.fontSize = 48;
            textMesh.color = new Color(0.7f, 0.98f, 0.88f, 1f);
            textMesh.gameObject.SetActive(visible);
            RefreshText();
        }
    }
}
