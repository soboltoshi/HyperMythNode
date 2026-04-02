# Interface Registry

| Interface | Owner | Consumers |
|-----------|-------|-----------|
| BlockProposalEnvelope | InterfaceRegistryBox | BlockBuilderBox, WorldBuilderBox, ArchivistBox |
| CrossBlockChangeContract | InterfaceRegistryBox | BlockBuilderBox, ArbiterBox, WorldBuilderBox, ArchivistBox |
| ReleaseGateContract | InterfaceRegistryBox | PublicReadinessBox, WorldBuilderBox, ArchivistBox |
| VoxelWorldContract | InterfaceRegistryBox | QuestXrEmbodimentBox, VoxelGameplayBox, HermesRuntimeBox |
