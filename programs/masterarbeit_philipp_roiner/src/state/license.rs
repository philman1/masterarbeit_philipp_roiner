use anchor_lang::prelude::*;

#[account]
pub struct License {
    pub license_type: u8,
    pub owner: Pubkey,
    pub licensed_image: Pubkey,
    pub timestamp: i64,
    pub valid_until: i64,
    pub license_information: String,
}

const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const TIMESTAMP_LENGTH: usize = 8;
const LICENS_TYPE_LENGTH: usize = 1;
const STRING_LENGTH_PREFIX: usize = 4; // Stores the size of the string.
const LICENSE_INFORMATION_LENGTH: usize = 50 * 4; // 50 chars max.

impl License {
    pub const LEN: usize = DISCRIMINATOR_LENGTH
        + LICENS_TYPE_LENGTH
        + PUBLIC_KEY_LENGTH // Owner.
        + PUBLIC_KEY_LENGTH // Licensed image.
        + TIMESTAMP_LENGTH // Timestamp.
        + TIMESTAMP_LENGTH // Valid until.
        + STRING_LENGTH_PREFIX + LICENSE_INFORMATION_LENGTH;
}
