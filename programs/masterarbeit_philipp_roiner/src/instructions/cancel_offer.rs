use anchor_lang::prelude::*;

use crate::state::offer::*;

pub fn cancel_offer_handler(ctx: Context<CancelOffer>) -> Result<()> {
    let offer_escrow_account = &mut ctx.accounts.offer_escrow_account;

    let amount: u64 = **offer_escrow_account
        .to_account_info()
        .try_borrow_lamports()?;

    **offer_escrow_account
        .to_account_info()
        .try_borrow_mut_lamports()? -= amount;
    **ctx
        .accounts
        .offer_maker
        .to_account_info()
        .try_borrow_mut_lamports()? += amount;
    Ok(())
}

#[derive(Accounts)]
pub struct CancelOffer<'info> {
    #[account(mut, has_one=offer_maker, close=offer_maker)]
    pub offer_account: Account<'info, Offer>,
    #[account(mut, signer)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub offer_maker: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    #[account( mut, constraint = offer_account.escrow_pda == offer_escrow_account.to_account_info().key())]
    //#[account( mut)]
    pub offer_escrow_account: Account<'info, EscrowAccount>,
}
