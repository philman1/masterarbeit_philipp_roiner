use anchor_lang::prelude::*;

use crate::state::error_codes::*;
use crate::state::{license::*, offer::*};

pub fn buy_rf_license_handler(ctx: Context<BuyRfLicense>) -> Result<()> {
    let payer = &mut ctx.accounts.payer;
    let author = &mut ctx.accounts.author;
    let image_account = &mut ctx.accounts.image_account;
    let amount: u64 = image_account.one_time_price;

    if image_account.license_type != 2 {
        return Err(error!(ErrorCodes::WrongLicenseType));
    }

    **payer
        .to_account_info()
        .try_borrow_mut_lamports()? -= amount;

    **author
        .to_account_info()
        .try_borrow_mut_lamports()? += amount;

    let license = &mut ctx.accounts.license;
    let clock: Clock = Clock::get().unwrap();

    license.license_type = 2; // RF license
    license.owner = ctx.accounts.payer.key();
    license.licensed_image = ctx.accounts.image_account.licensed_image.key();
    license.timestamp = clock.unix_timestamp;
    license.valid_until = None;
    license.license_information = None;

    Ok(())
}

#[derive(Accounts)]
pub struct BuyRfLicense<'info> {
    #[account(
        init,
        payer = author,
        space = License::LEN,
        seeds = [payer.key().as_ref(), b"license", image_account.licensed_image.key().as_ref()],
        bump
    )]
    pub license: Account<'info, License>,
    #[account(mut, constraint = image_account.author.key() == author.key())]
    pub image_account: Account<'info, Image>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub payer: Signer<'info>,
    #[account(mut, constraint = offer_account.author.key() == author.key())]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub author: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}
