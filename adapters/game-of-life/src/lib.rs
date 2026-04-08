use serde::{Deserialize, Serialize};

/// 3D cellular automaton adapter using B6/S5-7 rule on a Moore neighborhood.
/// Ported from the Unity-side `GameOfLifeVoxelAdapter.cs`.
/// Pure function: deterministic given the same seed and parameters.

const RULE_NAME: &str = "B6/S5-7 (3D Moore neighborhood)";

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
#[repr(u8)]
pub enum VoxelBlockType {
    Empty = 0,
    Grass = 1,
    Dirt = 2,
    Stone = 3,
    Lava = 4,
    Water = 5,
    Snow = 6,
    Bedrock = 7,
    Wood = 8,
    Leaf = 9,
    Ice = 10,
    RedFlower = 11,
    CrossGrass = 12,
    Mushroom = 13,
    LakeBottom = 14,
    Sand = 15,
    Evil = 16,
    LeafMold = 17,
    FrozeDirt = 18,
    GreyMushroom = 19,
    Bush = 20,
    DeadBranch = 21,
    Gold = 22,
    Coal = 23,
    Ruby = 24,
    YellowRock = 25,
    OrangeRock = 26,
    RedRock = 27,
    Cloud = 28,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameOfLifeRequest {
    pub width: u32,
    pub height: u32,
    pub depth: u32,
    pub steps: u32,
    pub seed_density: f32,
    pub random_seed: i32,
}

impl Default for GameOfLifeRequest {
    fn default() -> Self {
        Self {
            width: 42,
            height: 42,
            depth: 42,
            steps: 7,
            seed_density: 0.22,
            random_seed: 424242,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoxelCell {
    pub x: u32,
    pub y: u32,
    pub z: u32,
    pub block_type: VoxelBlockType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameOfLifeResult {
    pub width: u32,
    pub height: u32,
    pub depth: u32,
    pub steps: u32,
    pub random_seed: i32,
    pub alive_cells: u32,
    pub voxelized_cells: u32,
    pub rule: String,
    pub cells: Vec<VoxelCell>,
}

/// Derive a deterministic seed from a request string using FNV-1a hash.
pub fn derive_seed(request: &str, fallback: i32) -> i32 {
    let trimmed = request.trim();
    if trimmed.is_empty() {
        return fallback;
    }
    let mut hash: u32 = 2_166_136_261;
    for ch in trimmed.to_lowercase().chars() {
        hash ^= ch as u32;
        hash = hash.wrapping_mul(16_777_619);
    }
    (hash & 0x7FFF_FFFF) as i32
}

/// Run the 3D Game of Life automaton and produce a voxel grid.
pub fn generate(request: &GameOfLifeRequest) -> GameOfLifeResult {
    let width = request.width.max(8) as usize;
    let height = request.height.max(8) as usize;
    let depth = request.depth.max(8) as usize;
    let steps = request.steps.clamp(1, 48) as usize;
    let density = request.seed_density.clamp(0.05, 0.85);
    let seed = if request.random_seed == 0 {
        424242
    } else {
        request.random_seed
    };

    let sea_level = (height / 2).clamp(2, height.saturating_sub(3));

    let mut current = seed_automaton(width, height, depth, density, seed, sea_level);
    let mut next = vec![false; width * height * depth];

    for _ in 0..steps {
        step(&current, &mut next, width, height, depth);
        std::mem::swap(&mut current, &mut next);
    }

    let mut cells = Vec::new();
    let mut alive_cells: u32 = 0;
    let mut voxelized_cells: u32 = 0;
    let mut rng = SimpleRng::new((seed as u64) ^ 0x46F56A);

    for x in 0..width {
        for y in 0..height {
            for z in 0..depth {
                let i = idx(x, y, z, width, height, depth);

                if y == 0 {
                    cells.push(VoxelCell {
                        x: x as u32,
                        y: y as u32,
                        z: z as u32,
                        block_type: VoxelBlockType::Bedrock,
                    });
                    voxelized_cells += 1;
                    continue;
                }

                if current[i] {
                    alive_cells += 1;
                    let block = select_life_block(y, sea_level, rng.next_f64());
                    cells.push(VoxelCell {
                        x: x as u32,
                        y: y as u32,
                        z: z as u32,
                        block_type: block,
                    });
                    voxelized_cells += 1;
                    continue;
                }

                if y <= sea_level {
                    cells.push(VoxelCell {
                        x: x as u32,
                        y: y as u32,
                        z: z as u32,
                        block_type: VoxelBlockType::Water,
                    });
                    voxelized_cells += 1;
                    continue;
                }

                if y > sea_level && rng.next_f64() > 0.63 {
                    continue; // Empty
                }

                // Keep existing terrain-like fill
                cells.push(VoxelCell {
                    x: x as u32,
                    y: y as u32,
                    z: z as u32,
                    block_type: VoxelBlockType::Stone,
                });
                voxelized_cells += 1;
            }
        }
    }

    GameOfLifeResult {
        width: width as u32,
        height: height as u32,
        depth: depth as u32,
        steps: steps as u32,
        random_seed: seed,
        alive_cells,
        voxelized_cells,
        rule: RULE_NAME.to_string(),
        cells,
    }
}

#[inline]
fn idx(x: usize, y: usize, z: usize, _width: usize, height: usize, depth: usize) -> usize {
    x * height * depth + y * depth + z
}

fn seed_automaton(
    width: usize,
    height: usize,
    depth: usize,
    density: f32,
    seed: i32,
    sea_level: usize,
) -> Vec<bool> {
    let mut grid = vec![false; width * height * depth];
    let mut rng = SimpleRng::new(seed as u64);

    for x in 1..width.saturating_sub(1) {
        for y in 1..height.saturating_sub(1) {
            for z in 1..depth.saturating_sub(1) {
                let humidity_bias = if y <= sea_level { 0.05_f32 } else { -0.03 };
                let threshold = (density + humidity_bias).clamp(0.0, 1.0);
                if rng.next_f64() < threshold as f64 {
                    grid[idx(x, y, z, width, height, depth)] = true;
                }
            }
        }
    }

    grid
}

fn step(current: &[bool], next: &mut [bool], width: usize, height: usize, depth: usize) {
    for x in 0..width {
        for y in 0..height {
            for z in 0..depth {
                let neighbors = count_neighbors(current, x, y, z, width, height, depth);
                let alive = current[idx(x, y, z, width, height, depth)];
                let survives = alive && neighbors >= 5 && neighbors <= 7;
                let births = !alive && neighbors == 6;
                next[idx(x, y, z, width, height, depth)] = survives || births;
            }
        }
    }
}

fn count_neighbors(
    grid: &[bool],
    x: usize,
    y: usize,
    z: usize,
    width: usize,
    height: usize,
    depth: usize,
) -> u8 {
    let mut count: u8 = 0;
    for dx in -1_i32..=1 {
        for dy in -1_i32..=1 {
            for dz in -1_i32..=1 {
                if dx == 0 && dy == 0 && dz == 0 {
                    continue;
                }
                let nx = x as i32 + dx;
                let ny = y as i32 + dy;
                let nz = z as i32 + dz;
                if nx < 0
                    || ny < 0
                    || nz < 0
                    || nx >= width as i32
                    || ny >= height as i32
                    || nz >= depth as i32
                {
                    continue;
                }
                if grid[idx(nx as usize, ny as usize, nz as usize, width, height, depth)] {
                    count += 1;
                }
            }
        }
    }
    count
}

fn select_life_block(y: usize, sea_level: usize, roll: f64) -> VoxelBlockType {
    if y + 3 <= sea_level {
        if roll > 0.93 {
            VoxelBlockType::Coal
        } else {
            VoxelBlockType::Stone
        }
    } else if y <= sea_level + 1 {
        if roll > 0.95 {
            VoxelBlockType::Gold
        } else {
            VoxelBlockType::Grass
        }
    } else if roll > 0.9 {
        VoxelBlockType::CrossGrass
    } else {
        VoxelBlockType::Leaf
    }
}

/// Minimal deterministic PRNG (xorshift64).
struct SimpleRng {
    state: u64,
}

impl SimpleRng {
    fn new(seed: u64) -> Self {
        Self {
            state: if seed == 0 { 1 } else { seed },
        }
    }

    fn next_u64(&mut self) -> u64 {
        let mut s = self.state;
        s ^= s << 13;
        s ^= s >> 7;
        s ^= s << 17;
        self.state = s;
        s
    }

    fn next_f64(&mut self) -> f64 {
        (self.next_u64() >> 11) as f64 / ((1u64 << 53) as f64)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_generation_produces_cells() {
        let result = generate(&GameOfLifeRequest::default());
        assert_eq!(result.width, 42);
        assert_eq!(result.height, 42);
        assert_eq!(result.depth, 42);
        assert!(result.cells.len() > 0);
        assert!(result.alive_cells > 0);
        assert_eq!(result.rule, RULE_NAME);
    }

    #[test]
    fn deterministic_with_same_seed() {
        let req = GameOfLifeRequest {
            random_seed: 12345,
            ..Default::default()
        };
        let a = generate(&req);
        let b = generate(&req);
        assert_eq!(a.alive_cells, b.alive_cells);
        assert_eq!(a.voxelized_cells, b.voxelized_cells);
        assert_eq!(a.cells.len(), b.cells.len());
    }

    #[test]
    fn derive_seed_deterministic() {
        let a = derive_seed("hello world", 0);
        let b = derive_seed("hello world", 0);
        assert_eq!(a, b);
        assert_ne!(a, derive_seed("different", 0));
    }

    #[test]
    fn derive_seed_empty_returns_fallback() {
        assert_eq!(derive_seed("", 424242), 424242);
        assert_eq!(derive_seed("  ", 99), 99);
    }
}
