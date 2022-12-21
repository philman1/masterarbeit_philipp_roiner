use anchor_lang::prelude::*;

use crate::state::image::*;

/// Updates the availability of an image.
///
/// Arguments:
///
/// * `ctx`: Context<UpdateImage> - This is the context of the transaction. It contains the accounts
/// that are involved in the transaction.
/// * `available`: New availability
pub fn update_image_availability_handler(ctx: Context<UpdateImage>, available: bool) -> Result<()> {
    let image_account = &mut ctx.accounts.image_account;

    image_account.available = available;
    Ok(())
}

/// The function updates the license type of an image.
///
/// Arguments:
///
/// * `ctx`: Context<UpdateImage> - This is the context of the transaction. It contains the accounts
/// that are involved in the transaction.
/// * `allowed_license_types`: New license type.
pub fn update_image_allowed_license_types_handler(
    ctx: Context<UpdateImage>,
    allowed_license_types: u8,
) -> Result<()> {
    let image_account = &mut ctx.accounts.image_account;

    image_account.allowed_license_types = allowed_license_types;
    Ok(())
}

/// The function updates the one time price of an image
///
/// Arguments:
///
/// * `ctx`: Context<UpdateImage> - This is the context of the transaction. It contains the accounts
/// that are involved in the transaction.
/// * `one_time_price`: New price.
pub fn update_image_one_time_price_handler(
    ctx: Context<UpdateImage>,
    one_time_price: u64,
) -> Result<()> {
    let image_account = &mut ctx.accounts.image_account;

    image_account.one_time_price = one_time_price;
    Ok(())
}

/// Properties:
///
/// * `image_account`: This is the account that we're updating.
/// * `author`: The account that is updating the image and signing the instruction.
/// * `system_program`: This is the program that is running the instruction.
#[derive(Accounts)]
pub struct UpdateImage<'info> {
    #[account(mut, constraint = image_account.author.key() == author.key())]
    pub image_account: Account<'info, Image>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}
