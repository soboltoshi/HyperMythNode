-- Last Experiments Quest voxel startup script
-- These commands are parsed by VoxelLuaBridge.

-- carve a small staging pad
fill 18 8 18 24 8 24 Stone
fill 19 9 19 23 9 23 Grass

-- place a center marker
set 21 10 21 Gold

-- load an ASCII camp layout
load_ascii structures/camp.txt 16 9 16

-- optional adapter-driven generation examples:
-- life42 7 0.22 424242
-- threecard 6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN hyperflow_assembly 7 0.22
