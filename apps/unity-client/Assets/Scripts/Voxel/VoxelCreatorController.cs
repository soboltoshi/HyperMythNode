using System;
using UnityEngine;

namespace LastExperiments.Voxel
{
    public class VoxelCreatorController : MonoBehaviour
    {
        [SerializeField] private VoxelWorldRuntime worldRuntime;
        [SerializeField] private VoxelHologramPreview hologramPreview;
        [SerializeField] private float reachMeters = 8f;
        [SerializeField] private VoxelBlockType selectedBlock = VoxelBlockType.Grass;

        private int paletteIndex;
        private Vector3Int currentPlacement;
        private bool hasPlacement;

        public event Action<VoxelBlockType> SelectionChanged;

        public VoxelBlockType SelectedBlock => selectedBlock;

        private void Awake()
        {
            if (worldRuntime == null)
            {
                worldRuntime = GetComponent<VoxelWorldRuntime>();
            }

            if (hologramPreview == null)
            {
                hologramPreview = GetComponent<VoxelHologramPreview>();
            }

            SetSelection(selectedBlock);
        }

        public void Initialize(VoxelWorldRuntime runtime, VoxelHologramPreview preview)
        {
            worldRuntime = runtime;
            hologramPreview = preview;
            SetSelection(selectedBlock);
        }

        public void UpdatePreview(Transform origin)
        {
            if (origin == null || worldRuntime == null)
            {
                hasPlacement = false;
                hologramPreview?.Hide();
                return;
            }

            var ray = new Ray(origin.position, origin.forward);
            if (worldRuntime.TryRaycastGrid(ray, reachMeters, out _, out var placement))
            {
                hasPlacement = worldRuntime.InBounds(placement);
                currentPlacement = placement;

                if (hasPlacement)
                {
                    hologramPreview?.Show(currentPlacement, selectedBlock);
                    return;
                }
            }

            hasPlacement = false;
            hologramPreview?.Hide();
        }

        public bool TryPlace(Transform origin)
        {
            UpdatePreview(origin);
            if (!hasPlacement || worldRuntime == null)
            {
                return false;
            }

            return worldRuntime.SetBlock(currentPlacement, selectedBlock);
        }

        public bool TryRemove(Transform origin)
        {
            if (origin == null || worldRuntime == null)
            {
                return false;
            }

            var ray = new Ray(origin.position, origin.forward);
            if (!worldRuntime.TryRaycastGrid(ray, reachMeters, out var hitGrid, out _))
            {
                return false;
            }

            return worldRuntime.SetBlock(hitGrid, VoxelBlockType.Empty);
        }

        public void CycleSelection(int delta)
        {
            var palette = VoxelBlockRules.BuildPalette;
            if (palette.Count == 0)
            {
                return;
            }

            paletteIndex += delta;
            if (paletteIndex < 0)
            {
                paletteIndex = palette.Count - 1;
            }
            else if (paletteIndex >= palette.Count)
            {
                paletteIndex = 0;
            }

            SetSelection(palette[paletteIndex]);
        }

        public bool SelectByGlyph(char glyph)
        {
            if (!VoxelBlockRules.TryParseGlyph(glyph, out var type) || type == VoxelBlockType.Empty)
            {
                return false;
            }

            SetSelection(type);
            return true;
        }

        public string GetSelectionSummary()
        {
            return $"{selectedBlock} ({VoxelBlockRules.GetGlyph(selectedBlock)})";
        }

        private void SetSelection(VoxelBlockType blockType)
        {
            selectedBlock = blockType;
            var palette = VoxelBlockRules.BuildPalette;
            for (var i = 0; i < palette.Count; i++)
            {
                if (palette[i] == blockType)
                {
                    paletteIndex = i;
                    break;
                }
            }

            SelectionChanged?.Invoke(selectedBlock);
        }
    }
}
