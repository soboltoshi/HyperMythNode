using LastExperiments.Voxel;
using NUnit.Framework;
using UnityEngine;

namespace LastExperiments.Tests.EditMode
{
    public class VoxelAsciiPaletteTests
    {
        [Test]
        public void RenderSliceUsesBlockGlyphs()
        {
            var blocks = new VoxelBlockType[2, 2, 2];
            blocks[0, 1, 0] = VoxelBlockType.Grass;
            blocks[1, 1, 0] = VoxelBlockType.Stone;
            blocks[0, 1, 1] = VoxelBlockType.Water;
            blocks[1, 1, 1] = VoxelBlockType.Empty;

            var ascii = VoxelAsciiPalette.RenderSlice(blocks, 1);
            Assert.That(ascii, Is.EqualTo("GS\nW."));
        }

        [Test]
        public void ParseStructureBuildsPlacementsFromAscii()
        {
            var lines = new[] { "G.", ".S" };
            var placements = VoxelAsciiPalette.ParseStructure(lines, new Vector3Int(10, 4, 20));

            Assert.That(placements.Count, Is.EqualTo(2));
            Assert.That(placements[0].position, Is.EqualTo(new Vector3Int(10, 4, 20)));
            Assert.That(placements[0].block, Is.EqualTo(VoxelBlockType.Grass));
            Assert.That(placements[1].position, Is.EqualTo(new Vector3Int(11, 4, 21)));
            Assert.That(placements[1].block, Is.EqualTo(VoxelBlockType.Stone));
        }
    }
}
