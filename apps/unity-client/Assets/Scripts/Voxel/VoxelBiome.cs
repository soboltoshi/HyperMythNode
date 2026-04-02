namespace LastExperiments.Voxel
{
    public enum VoxelBiomeType : byte
    {
        Plain = 0,
        Dark = 1,
        Desert = 2,
        Frozen = 3,
        Jungle = 4,
        Tundra = 5,
        Mountain = 6
    }

    public readonly struct VoxelColumnSample
    {
        public readonly int Top;
        public readonly VoxelBiomeType Biome;
        public readonly float Moisture;
        public readonly float Temperature;

        public VoxelColumnSample(int top, VoxelBiomeType biome, float moisture, float temperature)
        {
            Top = top;
            Biome = biome;
            Moisture = moisture;
            Temperature = temperature;
        }
    }
}
