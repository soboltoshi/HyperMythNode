using LastExperiments.Voxel;
using NUnit.Framework;

namespace LastExperiments.Tests.EditMode
{
    public class VoxelBlockRulesTests
    {
        [Test]
        public void OpaqueAndCollidableRulesMatchExpectedSemantics()
        {
            Assert.That(VoxelBlockRules.IsOpaque(VoxelBlockType.Stone), Is.True);
            Assert.That(VoxelBlockRules.IsOpaque(VoxelBlockType.Water), Is.False);
            Assert.That(VoxelBlockRules.IsOpaque(VoxelBlockType.CrossGrass), Is.False);

            Assert.That(VoxelBlockRules.IsCollidable(VoxelBlockType.Stone), Is.True);
            Assert.That(VoxelBlockRules.IsCollidable(VoxelBlockType.Water), Is.False);
            Assert.That(VoxelBlockRules.IsCollidable(VoxelBlockType.Cloud), Is.False);
        }

        [Test]
        public void GlyphRoundTripWorksForCoreBlocks()
        {
            var glyph = VoxelBlockRules.GetGlyph(VoxelBlockType.Grass);
            Assert.That(glyph, Is.EqualTo('G'));

            var ok = VoxelBlockRules.TryParseGlyph(glyph, out var parsed);
            Assert.That(ok, Is.True);
            Assert.That(parsed, Is.EqualTo(VoxelBlockType.Grass));
        }
    }
}
