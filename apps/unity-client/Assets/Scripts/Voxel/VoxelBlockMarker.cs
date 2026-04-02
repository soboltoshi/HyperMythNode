using UnityEngine;

namespace LastExperiments.Voxel
{
    public class VoxelBlockMarker : MonoBehaviour
    {
        [SerializeField] private int x;
        [SerializeField] private int y;
        [SerializeField] private int z;
        [SerializeField] private VoxelBlockType blockType;

        public Vector3Int GridPosition => new(x, y, z);
        public VoxelBlockType BlockType => blockType;

        public void Set(Vector3Int position, VoxelBlockType type)
        {
            x = position.x;
            y = position.y;
            z = position.z;
            blockType = type;
        }
    }
}
