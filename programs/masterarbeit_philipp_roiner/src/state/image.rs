use anchor_lang::prelude::*;

#[account]
pub struct Image {
    pub author: Pubkey,
    pub timestamp: i64,
    pub mint_address: Pubkey,
    pub available: bool,
    pub allowed_license_types: u8, // e.g. 3 -> allow type 0, 1, 2 and 
    pub one_time_price: u64
}

const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const TIMESTAMP_LENGTH: usize = 8;
const ALLOWED_LICENSE_TYPES_LENGTH: usize = 1;
const PRICE_LENGTH: usize = 8;

impl Image {
    pub const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH // Author.
        + TIMESTAMP_LENGTH // Timestamp.
        + PUBLIC_KEY_LENGTH // NFT Token Address.
        + 1 // Availibilty
        + ALLOWED_LICENSE_TYPES_LENGTH
        + PRICE_LENGTH;
}
