use anchor_lang::prelude::*;

use crate::state::{license::*, offer::*};

pub fn accept_offer_handler(ctx: Context<AcceptOffer>) -> Result<()> {
    let offer_escrow_account = &mut ctx.accounts.offer_escrow_account;

    let amount: u64 = **offer_escrow_account
        .to_account_info()
        .try_borrow_lamports()?;

    **offer_escrow_account
        .to_account_info()
        .try_borrow_mut_lamports()? -= amount;
    **ctx
        .accounts
        .author
        .to_account_info()
        .try_borrow_mut_lamports()? += amount;

    let license = &mut ctx.accounts.license;
    let clock: Clock = Clock::get().unwrap();

    license.license_type = 3; // RM license
    license.owner = ctx.accounts.offer_maker.key();
    license.licensed_image = ctx.accounts.offer_account.mint.key();
    license.timestamp = clock.unix_timestamp;
    license.license_information = ctx.accounts.offer_account.offer_uri.clone();

    Ok(())
}

#[derive(Accounts)]
pub struct AcceptOffer<'info> {
    #[account(
        init,
        payer = author,
        space = License::LEN,
        seeds = [offer_maker.key().as_ref(), b"license", offer_account.mint.key().as_ref()],
        bump
    )]
    pub license: Account<'info, License>,
    #[account(mut, has_one=offer_maker, close=offer_maker)]
    pub offer_account: Account<'info, Offer>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub offer_maker: AccountInfo<'info>,
    #[account(mut, constraint = offer_account.author.key() == author.key())]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(mut, constraint = offer_account.escrow_pda == offer_escrow_account.to_account_info().key())]
    pub offer_escrow_account: Account<'info, EscrowAccount>,
}
