use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction::transfer};

use crate::state::license::*;
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

    license.license_type = 0;
    license.owner = ctx.accounts.offer_maker.key();
    license.licensed_image = ctx.accounts.offer_account.mint.key();
    license.timestamp = clock.unix_timestamp;
    license.license_information = ctx.accounts.offer_account.offer_uri.clone();

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
    #[account(mut, has_one=offer_maker, close=author)]
    pub offer_account: Account<'info, Offer>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub offer_maker: AccountInfo<'info>,
    #[account(mut, constraint = offer_account.author.key() == author.key())]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(mut, constraint = offer_account.escrow_pda == offer_escrow_account.to_account_info().key())]
    //#[account( mut)]
    pub offer_escrow_account: Account<'info, EscrowAccount>,
}
