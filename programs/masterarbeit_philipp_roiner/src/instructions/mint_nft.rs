use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_spl::token::mint_to;
use anchor_spl::token::{MintTo, Token};
use mpl_token_metadata::instruction::create_master_edition_v3;
use mpl_token_metadata::instruction::create_metadata_accounts_v3;
use mpl_token_metadata::instruction::mint_new_edition_from_master_edition_via_token;

use crate::state::error_codes::*;
use crate::state::image::*;

pub fn mint_nft_handler(
    ctx: Context<MintNFT>,
    creator_key: Pubkey,
    name: String,
    symbol: String,
    uri: String,
    allowed_license_types: u64,
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
    let creators = vec![
        mpl_token_metadata::state::Creator {
            address: creator_key,
            verified: false,
            share: 100,
        },
        mpl_token_metadata::state::Creator {
            address: ctx.accounts.mint_authority.key(),
            verified: false,
            share: 0,
        },
    ];

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
    let nft_token_address = &mut ctx.accounts.token_account;

    image.author = creator_key;
    image.timestamp = clock.unix_timestamp;
    image.nft_token_address = *nft_token_address.key;
    image.allowed_license_types = allowed_license_types;

    Ok(())
}

pub fn mint_print_edition_handler(ctx: Context<MintPrintEdition>, edition: u64) -> Result<()> {
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_accounts = MintTo {
        mint: ctx.accounts.new_mint.to_account_info(),
        to: ctx.accounts.token_account.to_account_info(),
        authority: ctx.accounts.payer.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    let result = mint_to(cpi_ctx, 1);
    if let Err(_) = result {
        return Err(error!(ErrorCodes::MintFailed));
    }

    let accounts = vec![
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.new_metadata.to_account_info(),
        ctx.accounts.new_edition.to_account_info(),
        ctx.accounts.master_edition.to_account_info(),
        ctx.accounts.new_mint.to_account_info(),
        ctx.accounts.edition_mark_pda.to_account_info(),
        ctx.accounts.new_mint_authority.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.token_account_owner.to_account_info(),
        ctx.accounts.token_account.to_account_info(),
        ctx.accounts.new_metadata_update_authority.to_account_info(),
        ctx.accounts.metadata.to_account_info(),
        // ctx.accounts.token_program.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.rent.to_account_info(),
    ];
    invoke(
        &mint_new_edition_from_master_edition_via_token(
            ctx.accounts.token_program.key(),
            ctx.accounts.new_metadata.key(),
            ctx.accounts.new_edition.key(),
            ctx.accounts.master_edition.key(),
            ctx.accounts.new_mint.key(),
            ctx.accounts.new_mint_authority.key(),
            ctx.accounts.payer.key(),
            ctx.accounts.token_account_owner.key(),
            ctx.accounts.token_account.key(),
            ctx.accounts.new_metadata_update_authority.key(),
            ctx.accounts.metadata.key(),
            ctx.accounts.metadata.key(),
            edition,
        ),
        &accounts.as_slice(),
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct MintNFT<'info> {
    #[account(init, payer = payer, space = Image::LEN)]
    pub image: Account<'info, Image>,

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
}

#[derive(Accounts)]
pub struct MintPrintEdition<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub original_mint: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub new_metadata: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub new_edition: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub new_mint: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub edition_mark_pda: UncheckedAccount<'info>,
    #[account(mut)]
    pub new_mint_authority: Signer<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub payer: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub token_account_owner: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub new_metadata_update_authority: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    // #[account(mut)]
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub rent: AccountInfo<'info>,
}
