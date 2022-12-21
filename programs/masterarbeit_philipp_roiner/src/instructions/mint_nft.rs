use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_spl::token::mint_to;
use anchor_spl::token::{MintTo, Token};
use mpl_token_metadata::instruction::create_master_edition_v3;
use mpl_token_metadata::instruction::create_metadata_accounts_v3;

use crate::state::error_codes::*;
use crate::state::image::*;

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
pub fn mint_nft_handler(
    ctx: Context<MintNFT>,
    creator_key: Pubkey,
    name: String,
    symbol: String,
    uri: String,
    available: bool,
    allowed_license_types: u8,
    one_time_price: u64,
) -> Result<()> {
    msg!("Nft token minting:");
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_accounts = MintTo {
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.token_account.to_account_info(),
        authority: ctx.accounts.payer.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    let result = mint_to(cpi_ctx, 1);
    if let Err(_) = result {
        return Err(error!(ErrorCodes::MintFailed));
    }
    msg!("Token minted !!!");

    msg!("Metadata account creating:");
    let accounts = vec![
        ctx.accounts.metadata.to_account_info(),
        ctx.accounts.mint.to_account_info(),
        ctx.accounts.mint_authority.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.rent.to_account_info(),
    ];
    let creators = vec![mpl_token_metadata::state::Creator {
        address: creator_key,
        verified: false,
        share: 100,
    }];

    let result = invoke(
        &create_metadata_accounts_v3(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.metadata.key(),
            ctx.accounts.mint.key(),
            ctx.accounts.mint_authority.key(),
            ctx.accounts.payer.key(),
            ctx.accounts.payer.key(),
            name,
            symbol,
            uri,
            Some(creators),
            1,
            true,
            false,
            None,
            None,
            None,
        ),
        &accounts,
    );

    if let Err(_) = result {
        return Err(error!(ErrorCodes::MetadataCreateFailed));
    }
    msg!("Metadata account created !!!");

    msg!("Creating master edition metadata account...");
    msg!(
        "Master edition metadata account address: {}",
        &ctx.accounts.master_edition.to_account_info().key()
    );
    invoke(
        &create_master_edition_v3(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.master_edition.key(),
            ctx.accounts.mint.key(),
            ctx.accounts.mint_authority.key(),
            ctx.accounts.mint_authority.key(),
            ctx.accounts.metadata.key(),
            ctx.accounts.mint_authority.key(),
            None,
        ),
        &[
            ctx.accounts.master_edition.to_account_info(),
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
    )?;

    let image = &mut ctx.accounts.image;
    let clock: Clock = Clock::get().unwrap();
    let mint_address = &mut ctx.accounts.mint;

    image.author = creator_key;
    image.timestamp = clock.unix_timestamp;
    image.mint_address = *mint_address.key;
    image.available = available;
    image.allowed_license_types = allowed_license_types;
    image.one_time_price = one_time_price;

    Ok(())
}

/// Properties:
///
/// * `mint_authority`: The account that is allowed to mint new NFTs
/// * `mint`: The account that will be the mint for the NFT
/// * `token_program`: The program that will be used to create the token
/// * `metadata`: This is the account that holds the metadata for the NFT.
/// * `master_edition`: This is the account that will hold the master edition of the NFT.
/// * `token_account`: This is the account that will hold the NFT.
/// * `token_metadata_program`: This is the program that will be used to store the metadata for the
/// token.
/// * `payer`: The account that pays for the storage of the new account
/// * `system_program`: The program that is used to create new accounts.
/// * `rent`: This is the account that pays for the rent of the program.
/// * `image`: The account that holds image specific information.
#[derive(Accounts)]
pub struct MintNFT<'info> {
    #[account(mut)]
    pub mint_authority: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub mint: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: We're about to create this with Metaplex
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: UncheckedAccount<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub payer: AccountInfo<'info>,

    pub system_program: Program<'info, System>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub rent: AccountInfo<'info>,

    #[account(
        init,
        payer = payer,
        space = Image::LEN,
        seeds = [mint.key().as_ref(), b"image", mint_authority.key().as_ref()],
        bump
    )]
    pub image: Account<'info, Image>,
}
