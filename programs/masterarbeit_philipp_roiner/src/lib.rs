use anchor_lang::prelude::*;

mod instructions;
mod state;
use crate::accept_offer::*;
use crate::cancel_offer::*;
use crate::make_offer::*;
use crate::mint_nft::*;
use instructions::*;

declare_id!("4euwMgqxB9GkxVBY7uXKRRuC68yhkNbsVUhDPYS1mbhD");

#[program]
pub mod masterarbeit_philipp_roiner {

    use super::*;

    pub fn mint_nft(
        ctx: Context<MintNFT>,
        creator_key: Pubkey,
        name: String,
        symbol: String,
        uri: String,
        allowed_license_types: u64,
    ) -> Result<()> {
        mint_nft_handler(ctx, creator_key, name, symbol, uri, allowed_license_types)
    }

    pub fn create_metadata_account(
        ctx: Context<CreateMetadataAccount>,
        creator_key: Pubkey,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        create_metadata_account_handler(ctx, creator_key, uri, name, symbol)
    }

    pub fn create_master_edition(
        ctx: Context<CreateMasterEdition>,
        max_supply: Option<u64>,
    ) -> Result<()> {
        create_master_edition_handler(ctx, max_supply)
    }

    pub fn mint_edition(ctx: Context<MintPrintEdition>, edition: u64) -> Result<()> {
        mint_print_edition_handler(ctx, edition)
    }

    pub fn make_offer(
        ctx: Context<MakeOffer>,
        escrowed_tokens_of_offer_maker_bump: u8,
        im_offering_this_much: u64,
        how_much_i_want_of_what_you_have: u64,
    ) -> Result<()> {
        make_offer_handler(
            ctx,
            escrowed_tokens_of_offer_maker_bump,
            im_offering_this_much,
            how_much_i_want_of_what_you_have,
        )
    }

    pub fn accept_offer(ctx: Context<AcceptOffer>) -> Result<()> {
        accept_offer_handler(ctx)
    }

    pub fn cancel_offer(ctx: Context<CancelOffer>) -> Result<()> {
        cancel_offer_handler(ctx)
    }
}
