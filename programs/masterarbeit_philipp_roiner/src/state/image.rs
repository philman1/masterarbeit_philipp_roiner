use anchor_lang::prelude::*;

#[account]
pub struct Image {
    pub author: Pubkey,
    pub timestamp: i64,
    pub nft_token_address: Pubkey,
    pub allowed_license_types: u8, // e.g. 3 -> allow type 0, 1, 2 and 3
}

const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const TIMESTAMP_LENGTH: usize = 8;
const ALLOWED_LICENSE_TYPES_LENGTH: usize = 1;

impl Image {
    pub const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH // Author.
        + TIMESTAMP_LENGTH // Timestamp.
        + ALLOWED_LICENSE_TYPES_LENGTH;
}
