-- Last Experiments Quest voxel startup script
-- These commands are parsed by VoxelLuaBridge.

-- carve a small staging pad
fill 18 8 18 24 8 24 Stone
fill 19 9 19 23 9 23 Grass

-- place a center marker
set 21 10 21 Gold

-- load an ASCII camp layout
load_ascii structures/camp.txt 16 9 16
