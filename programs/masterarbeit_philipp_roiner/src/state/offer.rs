use anchor_lang::prelude::*;

#[account]
pub struct Offer {
    pub who_made_the_offer: Pubkey,
    pub kind_of_token_wanted_in_return: Pubkey,
    pub amount_received_if_offer_accepted: u64,
    pub escrowed_tokens_of_offer_maker_bump: u8,
}

const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const AMOUNT: usize = 8;
const BUMB: usize = 1;

impl Offer {
    pub const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH // Owner.
        + PUBLIC_KEY_LENGTH // Licensed image.
        + AMOUNT // Timestamp.
        + BUMB;
}
