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

declare_id!("5C4WbaLJTN1q7UiUAcC3yYttbEHK6AUvFoopzeDhmMj9");

#[program]
pub mod masterarbeit_philipp_roiner {

    use super::*;

    /// Mints a token, creates a metadata account, creates a master edition account
    /// and a image account for a given image that is stored on the IPFS.
    ///
    /// Arguments:
    ///
    /// * `ctx`: Context<MintNFT>
    /// * `creator_key`: The public key of the creator of the NFT.
    /// * `name`: The name of the NFT.
    /// * `symbol`: The symbol of the token.
    /// * `uri`: The URI of the NFT.
    /// * `available`: Whether the NFT is available for purchase or not.
    /// * `allowed_license_types`: Specifies the license type.
    /// * `one_time_price`: Specifies the price for an RF license.
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

    /// Mints a new edition for a given master edition and copies its NFT and metadata.
    ///
    /// Arguments:
    ///
    /// * `ctx`: Context<MintPrintEdition>
    /// * `edition`: Edition number
    pub fn mint_edition(ctx: Context<MintPrintEdition>, edition: u64) -> Result<()> {
        mint_print_edition_handler(ctx, edition)
    }

    /// It initializes a new offer account and a corresponding offer escrow account.
    ///
    /// Arguments:
    ///
    /// * `ctx`: Context<InitializeOffer>
    /// * `bump`: The offer account bump.
    /// * `escrow_bump`: The offer escrow account bump.
    /// * `offer_uri`: The URI of the offer.
    pub fn initialize_offer(
        ctx: Context<InitializeOffer>,
        bump: u8,
        escrow_bump: u8,
        offer_uri: String,
    ) -> Result<()> {
        initialize_offer_handler(ctx, bump, escrow_bump, offer_uri)
    }

    /// Transfers funds to the offer escrow account.
    ///
    /// Arguments:
    ///
    /// * `ctx`: Context<MakeOffer>
    /// * `lamports`: The amount of lamports to transfer to the offer escrow account.
    pub fn make_offer(ctx: Context<MakeOffer>, lamports: u64) -> Result<()> {
        make_offer_handler(ctx, lamports)
    }

    /// The funds of the offer escrow account will be transferred back to the offer maker.
    ///
    /// Arguments:
    ///
    /// * `ctx`: Context<CancelOffer> - This is the context of the transaction. It contains the accounts
    /// that are involved in the transaction.
    pub fn cancel_offer(ctx: Context<CancelOffer>) -> Result<()> {
        cancel_offer_handler(ctx)
    }

    /// The offer escrow account is debited and the offer maker is credited. The license is updated to
    /// reflect the new owner and the license type
    ///
    /// Arguments:
    /// that are involved in the transaction.
    /// * `ctx`: Context<AcceptOffer> - This is the context of the transaction. It contains the accounts
    /// that are involved in the transaction.
    pub fn accept_offer(ctx: Context<AcceptOffer>) -> Result<()> {
        accept_offer_handler(ctx)
    }

    /// Updates the availability of an image.
    ///
    /// Arguments:
    ///
    /// * `ctx`: Context<UpdateImage> - This is the context of the transaction. It contains the accounts
    /// that are involved in the transaction.
    /// * `available`: New availability
    pub fn update_image_availability(ctx: Context<UpdateImage>, availability: bool) -> Result<()> {
        update_image_availability_handler(ctx, availability)
    }

    /// The function updates the license type of an image.
    ///
    /// Arguments:
    ///
    /// * `ctx`: Context<UpdateImage> - This is the context of the transaction. It contains the accounts
    /// that are involved in the transaction.
    /// * `allowed_license_types`: New license type.
    pub fn update_image_allowed_license_types(
        ctx: Context<UpdateImage>,
        allowed_license_types: u8,
    ) -> Result<()> {
        update_image_allowed_license_types_handler(ctx, allowed_license_types)
    }

    /// The function updates the one time price of an image
    ///
    /// Arguments:
    ///
    /// * `ctx`: Context<UpdateImage> - This is the context of the transaction. It contains the accounts
    /// that are involved in the transaction.
    /// * `one_time_price`: New price.
    pub fn update_image_one_time_price(
        ctx: Context<UpdateImage>,
        one_time_price: u64,
    ) -> Result<()> {
        update_image_one_time_price_handler(ctx, one_time_price)
    }

    /// If the image account allows RF licenses, then transfer the one-time price from the payer to the
    /// author, and create a new RF license for the payer.
    ///
    /// Arguments:
    ///
    /// * `ctx`: Context<BuyRfLicense> - This is the context of the transaction. It contains the accounts
    /// that are involved in the transaction.
    pub fn buy_rf_license(ctx: Context<BuyRfLicense>) -> Result<()> {
        buy_rf_license_handler(ctx)
    }

    /// This function creates a RM license for the given image account.
    ///
    /// Arguments:
    ///
    /// * `ctx`: Context<CreateLicense> - This is the context of the transaction. It contains the accounts
    /// that are involved in the transaction.
    /// * `valid_until`: The time in seconds since the Unix epoch when the license expires.
    /// * `license_information`: CID from the IPFS that holds all the license information.
    pub fn create_license(
        ctx: Context<CreateLicense>,
        valid_until: i64,
        license_information: String,
    ) -> Result<()> {
        create_license_handler(ctx, valid_until, license_information)
    }
}
