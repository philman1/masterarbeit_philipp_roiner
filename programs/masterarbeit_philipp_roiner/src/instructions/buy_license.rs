use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction::transfer};

use crate::state::error_codes::*;
use crate::state::image::*;
use crate::state::license::*;

/// If the image account allows RF licenses, then transfer the one-time price from the payer to the
/// author, and create a new RF license for the payer.
///
/// Arguments:
///
/// * `ctx`: Context<BuyRfLicense> - This is the context of the transaction. It contains the accounts
/// that are involved in the transaction.
pub fn buy_rf_license_handler(ctx: Context<BuyRfLicense>) -> Result<()> {
    let image_account = &mut ctx.accounts.image_account;
    let amount: u64 = image_account.one_time_price;

    if image_account.allowed_license_types != 2 {
        return Err(error!(ErrorCodes::WrongLicenseType));
    }

    let transfer_instruction = &transfer(
        ctx.accounts.payer.to_account_info().key,
        ctx.accounts.author.to_account_info().key,
        amount,
    );
    msg!("Paying in {}", amount);
    invoke(
        transfer_instruction,
        &[
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.author.to_account_info(),
        ],
    )?;

    let license = &mut ctx.accounts.license;
    let clock: Clock = Clock::get().unwrap();

    license.license_type = 2; // RF license
    license.owner = ctx.accounts.payer.key();
    license.licensed_image = ctx.accounts.image_account.mint_address.key();
    license.timestamp = clock.unix_timestamp;
    license.valid_until = None;
    license.license_information = None;

    Ok(())
}

/// Properties:
///
/// * `license`: License account that will be created. Seeds are the payer's key (author), the
/// string "license", and the image account's mint address.
/// * `image_account`: This is the account that holds information about the image.
/// * `payer`: The account that pays and signs for the transaction.
/// * `author`: The author of the image
/// * `system_program`: The program that is used to create new accounts.
#[derive(Accounts)]
pub struct BuyRfLicense<'info> {
    #[account(
        init,
        payer = payer,
        space = License::LEN,
        seeds = [payer.key().as_ref(), b"license", image_account.mint_address.key().as_ref()],
        bump
    )]
    pub license: Account<'info, License>,
    #[account(mut, constraint = image_account.author.key() == author.key())]
    pub image_account: Account<'info, Image>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub payer: Signer<'info>,
    #[account(mut, constraint = image_account.author.key() == author.key())]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub author: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}
