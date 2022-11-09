use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_spl::token::Token;
use mpl_token_metadata::instruction::mint_new_edition_from_master_edition_via_token;

pub fn mint_print_edition_handler(ctx: Context<MintPrintEdition>, edition: u64) -> Result<()> {
    let accounts = vec![
        ctx.accounts.original_mint.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.new_metadata.to_account_info(),
        ctx.accounts.new_edition.to_account_info(),
        ctx.accounts.master_edition.to_account_info(),
        ctx.accounts.new_mint.to_account_info(),
        ctx.accounts.new_token_account.to_account_info(),
        ctx.accounts.edition_mark_pda.to_account_info(),
        ctx.accounts.new_mint_authority.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.token_account_owner.to_account_info(),
        ctx.accounts.token_account.to_account_info(),
        ctx.accounts.new_metadata_update_authority.to_account_info(),
        ctx.accounts.metadata.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.token_metadata_program.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.rent.to_account_info(),
    ];

    // msg!("{:?}", &accounts);

    invoke(
        &mint_new_edition_from_master_edition_via_token(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.new_metadata.key(),
            ctx.accounts.new_edition.key(),
            ctx.accounts.master_edition.key(),
            ctx.accounts.new_mint.key(),
            ctx.accounts.new_mint_authority.key(),
            ctx.accounts.payer.key(),
            ctx.accounts.token_account_owner.key(),
            ctx.accounts.token_account.key(),
            ctx.accounts.new_metadata_update_authority.key(),
            ctx.accounts.metadata.key(),
            ctx.accounts.original_mint.key(),
            edition,
        ),
        &accounts,
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct MintPrintEdition<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub original_mint: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub new_metadata: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub new_edition: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub new_mint: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub new_token_account: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub edition_mark_pda: UncheckedAccount<'info>,
    #[account(mut)]
    pub new_mint_authority: Signer<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub payer: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub token_account_owner: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub new_metadata_update_authority: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: UncheckedAccount<'info>,
    // #[account(mut)]
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub rent: AccountInfo<'info>,
}
