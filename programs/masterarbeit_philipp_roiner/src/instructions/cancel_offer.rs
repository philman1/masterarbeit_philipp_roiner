use anchor_lang::prelude::*;

use crate::state::offer::*;

/// The funds of the offer escrow account will be transferred back to the offer maker.
///
/// Arguments:
///
/// * `ctx`: Context<CancelOffer> - This is the context of the transaction. It contains the accounts
/// that are involved in the transaction.
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

/// Properties:
///
/// * `offer_account`: The account that holds the offer.
/// * `offer_maker`: The account that created the offer.
/// * `system_program`: The program that is running this instruction.
/// * `offer_escrow_account`: This is the account that holds the funds that the offer maker is offering.
#[derive(Accounts)]
pub struct CancelOffer<'info> {
    #[account(mut, has_one=offer_maker, close=offer_maker)]
    pub offer_account: Account<'info, Offer>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub offer_maker: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    #[account( mut, constraint = offer_account.escrow_pda == offer_escrow_account.to_account_info().key())]
    pub offer_escrow_account: Account<'info, EscrowAccount>,
}
