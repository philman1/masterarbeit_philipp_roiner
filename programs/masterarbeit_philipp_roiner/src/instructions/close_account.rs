use crate::state::image::*;
use anchor_lang::prelude::*;

pub fn close_account_handler(ctx: Context<Close>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct Close<'info> {
    #[account(mut, close = author)]
    account: Account<'info, Image>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    author: AccountInfo<'info>,
}
