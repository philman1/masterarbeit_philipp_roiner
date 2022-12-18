use anchor_lang::prelude::*;

use crate::state::image::*;
use crate::state::license::*;

pub fn create_license_handler(ctx: Context<BuyRfLicense>, valid_until: i64, license_information: String) -> Result<()> {
    let license = &mut ctx.accounts.license;
    let clock: Clock = Clock::get().unwrap();

    license.license_type = 3; // RM license
    license.owner = ctx.accounts.payer.key();
    license.licensed_image = ctx.accounts.image_account.mint_address.key();
    license.timestamp = clock.unix_timestamp;
    license.valid_until = None;
    license.license_information = Some(license_information);

    Ok(())
}

#[derive(Accounts)]
pub struct CreateLicense<'info> {
    #[account(
        init,
        payer = author,
        space = License::LEN,
        seeds = [license_recipient.key().as_ref(), b"license", image_account.mint_address.key().as_ref()],
        bump
    )]
    pub license: Account<'info, License>,
    #[account(mut, constraint = image_account.author.key() == author.key())]
    pub image_account: Account<'info, Image>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub license_recipient: AccountInfo<'info>,
    #[account(mut, constraint = image_account.author.key() == author.key())]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}
