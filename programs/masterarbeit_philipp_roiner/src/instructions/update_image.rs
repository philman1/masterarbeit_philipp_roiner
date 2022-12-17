use anchor_lang::prelude::*;

use crate::state::image::*;

pub fn update_image_availability_handler(ctx: Context<UpdateImage>, available: bool) -> Result<()> {
    let image_account = &mut ctx.accounts.image_account;

    image_account.available = available;
    Ok(())
}

pub fn update_image_allowed_license_types_handler(
    ctx: Context<UpdateImage>,
    allowed_license_types: u8,
) -> Result<()> {
    let image_account = &mut ctx.accounts.image_account;

    image_account.allowed_license_types = allowed_license_types;
    Ok(())
}

pub fn update_image_one_time_price_handler(
    ctx: Context<UpdateImage>,
    one_time_price: u64,
) -> Result<()> {
    let image_account = &mut ctx.accounts.image_account;

    image_account.one_time_price = one_time_price;
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateImage<'info> {
    #[account(mut, constraint = image_account.author.key() == author.key())]
    pub image_account: Account<'info, Image>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}
