use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction::transfer};

use crate::state::offer::*;

pub fn make_offer_handler(ctx: Context<MakeOffer>, lamports: u64) -> Result<()> {
    let offer_account = &mut ctx.accounts.offer_account;
    let offer_escrow_account = &mut ctx.accounts.offer_escrow_account;
    let transfer_instruction = &transfer(
        &offer_account.offer_maker,
        &offer_escrow_account.to_account_info().key,
        lamports,
    );
    msg!("Paying in {}", lamports);
    invoke(
        transfer_instruction,
        &[
            ctx.accounts.offer_maker.to_account_info(),
            offer_escrow_account.to_account_info(),
        ],
    )?;
    Ok(())
}

#[derive(Accounts)]
pub struct MakeOffer<'info> {
    #[account(has_one = offer_maker)]
    pub offer_account: Account<'info, Offer>,
    #[account(signer)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub offer_maker: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    #[account( mut, constraint = offer_account.escrow_pda == *offer_escrow_account.to_account_info().key)]
    pub offer_escrow_account: Account<'info, EscrowAccount>,
}
