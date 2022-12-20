use anchor_lang::prelude::*;

mod instructions;
mod state;
use crate::accept_offer::*;
use crate::buy_license::*;
use crate::cancel_offer::*;
use crate::create_license::*;
use crate::init_offer::*;
use crate::make_offer::*;
use crate::mint_nft::*;
use crate::print_edition::*;
use crate::update_image::*;
use instructions::*;

declare_id!("FhKv5xKBKppK18jRDwAcXtpmALWzqppGkW2sPZ578YqQ");

#[program]
pub mod masterarbeit_philipp_roiner {

    use super::*;

    pub fn mint_nft(
        ctx: Context<MintNFT>,
        creator_key: Pubkey,
        name: String,
        symbol: String,
        uri: String,
        available: bool,
        allowed_license_types: u8,
        one_time_price: u64,
    ) -> Result<()> {
        mint_nft_handler(
            ctx,
            creator_key,
            name,
            symbol,
            uri,
            available,
            allowed_license_types,
            one_time_price,
        )
    }

    pub fn mint_edition(ctx: Context<MintPrintEdition>, edition: u64) -> Result<()> {
        mint_print_edition_handler(ctx, edition)
    }

    pub fn initialize_offer(
        ctx: Context<InitializeOffer>,
        bump: u8,
        escrow_bump: u8,
        offer_uri: String,
    ) -> Result<()> {
        initialize_offer_handler(ctx, bump, escrow_bump, offer_uri)
    }

    pub fn make_offer(ctx: Context<MakeOffer>, lamports: u64) -> Result<()> {
        make_offer_handler(ctx, lamports)
    }

    pub fn cancel_offer(ctx: Context<CancelOffer>) -> Result<()> {
        cancel_offer_handler(ctx)
    }

    pub fn accept_offer(ctx: Context<AcceptOffer>) -> Result<()> {
        accept_offer_handler(ctx)
    }

    pub fn update_image_availability(ctx: Context<UpdateImage>, availability: bool) -> Result<()> {
        update_image_availability_handler(ctx, availability)
    }

    pub fn update_image_allowed_license_types(
        ctx: Context<UpdateImage>,
        allowed_license_types: u8,
    ) -> Result<()> {
        update_image_allowed_license_types_handler(ctx, allowed_license_types)
    }

    pub fn update_image_one_time_price(
        ctx: Context<UpdateImage>,
        one_time_price: u64,
    ) -> Result<()> {
        update_image_one_time_price_handler(ctx, one_time_price)
    }

    pub fn buy_rf_license(ctx: Context<BuyRfLicense>) -> Result<()> {
        buy_rf_license_handler(ctx)
    }

    pub fn create_license(
        ctx: Context<CreateLicense>,
        valid_until: i64,
        license_information: String,
    ) -> Result<()> {
        create_license_handler(ctx, valid_until, license_information)
    }
}
