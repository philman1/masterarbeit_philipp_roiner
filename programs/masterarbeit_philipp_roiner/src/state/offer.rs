use anchor_lang::prelude::*;

// #[account]
// pub struct Offer {
//     pub who_made_the_offer: Pubkey,
//     pub kind_of_token_wanted_in_return: Pubkey,
//     // pub amount_received_if_offer_accepted: u64,
//     pub escrowed_tokens_of_offer_maker_bump: u8,
// }

// const DISCRIMINATOR_LENGTH: usize = 8;
// const PUBLIC_KEY_LENGTH: usize = 32;
// // const AMOUNT: usize = 8;
// const BUMB: usize = 1;

// impl Offer {
//     pub const LEN: usize = DISCRIMINATOR_LENGTH
//         + PUBLIC_KEY_LENGTH // Owner.
//         + PUBLIC_KEY_LENGTH // Licensed image.
//         // + AMOUNT // Timestamp.
//         + BUMB;
// }

#[account]
pub struct Offer {
    pub offer_maker: Pubkey,
    pub mint: Pubkey,
    pub author: Pubkey,
    pub offer_uri: String,
    pub bump: u8,
    pub escrow_bump: u8,
    pub escrow_pda: Pubkey,
}

const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const STRING_LENGTH_PREFIX: usize = 4; // Stores the size of the string.
const MAX_URI_LENGTH: usize = 50 * 4; // 50 chars max.

impl Offer {
    pub const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH
        + PUBLIC_KEY_LENGTH
        + PUBLIC_KEY_LENGTH
        + STRING_LENGTH_PREFIX
        + MAX_URI_LENGTH
        + 1
        + 1
        + PUBLIC_KEY_LENGTH;
}

#[account]
pub struct EscrowAccount {}
