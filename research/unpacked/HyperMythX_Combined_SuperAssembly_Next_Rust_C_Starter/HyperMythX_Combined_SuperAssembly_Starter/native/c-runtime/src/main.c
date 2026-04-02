#include <stdio.h>

int main(void) {
    puts("{");
    puts("  \"runtime\": \"c-supernode-component\",");
    puts("  \"builder_agent\": \"ASIMOG\",");
    puts("  \"mode\": \"starter\",");
    puts("  \"notes\": [");
    puts("    \"C is reserved for low-level portable runtime pieces.\",");
    puts("    \"Use it later for thin deterministic helpers or embedded paths.\",");
    puts("    \"This starter proves the native C lane is part of the repo.\"");
    puts("  ]");
    puts("}");
    return 0;
}
