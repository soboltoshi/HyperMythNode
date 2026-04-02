using LastExperiments.World;
using NUnit.Framework;
using UnityEngine;

namespace LastExperiments.Tests.EditMode
{
    public class WorldBoundsRendererTests
    {
        [Test]
        public void RenderBounds_CreatesTwelveFrameEdges()
        {
            var host = new GameObject("BoundsHost");
            var renderer = host.AddComponent<WorldBoundsRenderer>();

            renderer.RenderBounds(new[] { 42, 42, 16 }, 0.08f, host.transform);

            Assert.AreEqual(12, host.transform.childCount);

            Object.DestroyImmediate(host);
        }
    }
}
