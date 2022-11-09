use anchor_lang::prelude::*;

use crate::state::offer::*;

pub fn initialize_offer_handler(
    ctx: Context<InitializeOffer>,
    bump: u8,
    escrow_bump: u8,
    offer_uri: String,
) -> Result<()> {
    let offer_account = &mut ctx.accounts.offer_account;

    offer_account.offer_maker = ctx.accounts.offer_maker.key();
    offer_account.mint = ctx.accounts.mint.key();
    offer_account.author = ctx.accounts.author.key();
    offer_account.offer_uri = offer_uri;
    offer_account.bump = bump;
    offer_account.escrow_bump = escrow_bump;
    offer_account.escrow_pda = ctx.accounts.offer_escrow_account.to_account_info().key();
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeOffer<'info> {
    #[account(
        init,
        payer = offer_maker,
        space = Offer::LEN,
        seeds = [offer_maker.key().as_ref(), mint.key().as_ref()],
        bump
    )]
    pub offer_account: Account<'info, Offer>,
    #[account(mut)]
    pub offer_maker: Signer<'info>,
    // #[account(mut)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub mint: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub author: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    #[account(
        init,
        payer = offer_maker,
        space = 8,
        seeds = [offer_maker.key().as_ref(), b"escrow", mint.key().as_ref()],
        bump
    )]
    pub offer_escrow_account: Account<'info, EscrowAccount>,
}
