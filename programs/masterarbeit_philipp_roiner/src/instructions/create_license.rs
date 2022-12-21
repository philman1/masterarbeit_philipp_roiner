use anchor_lang::prelude::*;

use crate::state::image::*;
use crate::state::license::*;

/// This function creates a RM license for the given image account.
///
/// Arguments:
///
/// * `ctx`: Context<CreateLicense> - This is the context of the transaction. It contains the accounts
/// that are involved in the transaction.
/// * `valid_until`: The time in seconds since the Unix epoch when the license expires.
/// * `license_information`: CID from the IPFS that holds all the license information.
pub fn create_license_handler(
    ctx: Context<CreateLicense>,
    valid_until: i64,
    license_information: String,
) -> Result<()> {
    let license = &mut ctx.accounts.license;
    let clock: Clock = Clock::get().unwrap();

    license.license_type = 3; // RM license
    license.owner = ctx.accounts.license_recipient.key();
    license.licensed_image = ctx.accounts.image_account.mint_address.key();
    license.timestamp = clock.unix_timestamp;
    license.valid_until = Some(valid_until);
    license.license_information = Some(license_information);

    Ok(())
}

/// Properties:
///
/// * `license`: This is the account that will hold the license.
/// * `image_account`: This is the account that holds information about the image.
/// * `license_recipient`: The account that will receive the license.
/// * `author`: The account that signs the transaction.
/// * `system_program`: The program that is used to create new accounts.
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
