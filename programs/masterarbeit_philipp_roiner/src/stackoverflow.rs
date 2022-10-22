use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_spl::token;
use anchor_spl::token::{MintTo, Token};
use mpl_token_metadata::instruction::{
    create_master_edition_v3, create_metadata_accounts_v2,
    mint_new_edition_from_master_edition_via_token,
};

declare_id!("4euwMgqxB9GkxVBY7uXKRRuC68yhkNbsVUhDPYS1mbhD");

#[program]
pub mod masterarbeit_philipp_roiner {
    use super::*;

    pub fn mint_nft(ctx: Context<MintNFT>) -> Result<()> {
        msg!("Initializing Mint NFT");
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        };
        msg!("CPI Accounts Assigned");
        let cpi_program = ctx.accounts.token_program.to_account_info();
        msg!("CPI Program Assigned");
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        msg!("CPI Context Assigned");
        token::mint_to(cpi_ctx, 1)?;
        msg!("Token Minted !!!");
        Ok(())
    }

    pub fn create_metadata_account(
        ctx: Context<CreateMetadataAccount>,
        creator_key: Pubkey,
        uri: String,
        title: String,
        symbol: String,
    ) -> Result<()> {
        msg!("Initializing the creation of a new metadata account");
        let account_info = vec![
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.token_metadata_program.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ];
        msg!("Account Info Assigned");
        let creator = vec![
            mpl_token_metadata::state::Creator {
                address: creator_key,
                verified: false,
                share: 100,
            },
            mpl_token_metadata::state::Creator {
                address: ctx.accounts.mint_authority.key(),
                verified: false,
                share: 0,
            },
        ];
        msg!("Creator Assigned");
        // let symbol = std::string::ToString::to_string("LWB");
        invoke(
            &create_metadata_accounts_v2(
                ctx.accounts.token_metadata_program.key(),
                ctx.accounts.metadata.key(),
                ctx.accounts.mint.key(),
                ctx.accounts.mint_authority.key(),
                ctx.accounts.payer.key(),
                ctx.accounts.payer.key(),
                title,
                symbol,
                uri,
                Some(creator),
                1,
                true,
                false,
                None,
                None,
            ),
            account_info.as_slice(),
        )?;
        msg!("Metadata Account Created !!!");
        // let master_edition_infos = vec![
        //     ctx.accounts.master_edition.to_account_info(),
        //     ctx.accounts.mint.to_account_info(),
        //     ctx.accounts.mint_authority.to_account_info(),
        //     ctx.accounts.payer.to_account_info(),
        //     ctx.accounts.metadata.to_account_info(),
        //     ctx.accounts.token_metadata_program.to_account_info(),
        //     ctx.accounts.token_program.to_account_info(),
        //     ctx.accounts.system_program.to_account_info(),
        //     ctx.accounts.rent.to_account_info(),
        // ];
        // msg!("Master Edition Account Infos Assigned");
        // invoke(
        //     &create_master_edition_v3(
        //         ctx.accounts.token_metadata_program.key(),
        //         ctx.accounts.master_edition.key(),
        //         ctx.accounts.mint.key(),
        //         ctx.accounts.payer.key(),
        //         ctx.accounts.mint_authority.key(),
        //         ctx.accounts.metadata.key(),
        //         ctx.accounts.payer.key(),
        //         None,
        //     ),
        //     master_edition_infos.as_slice(),
        // )?;
        // msg!("Master Edition Nft Minted !!!");
        Ok(())
    }

    pub fn create_master_edition(
        ctx: Context<CreateMasterEdition>,
        max_supply: Option<u64>,
    ) -> Result<()> {
        let master_edition_infos = vec![
            ctx.accounts.master_edition.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.token_metadata_program.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ];
        msg!("Master Edition Account Infos Assigned");
        invoke(
            &create_master_edition_v3(
                ctx.accounts.token_metadata_program.key(),
                ctx.accounts.master_edition.key(),
                ctx.accounts.mint.key(),
                ctx.accounts.payer.key(),
                ctx.accounts.mint_authority.key(),
                ctx.accounts.metadata.key(),
                ctx.accounts.payer.key(),
                max_supply,
            ),
            master_edition_infos.as_slice(),
        )?;
        msg!("Master Edition Nft Minted !!!");
        Ok(())
    }

    pub fn create_new_edition_nft(ctx: Context<CreateNewEdition>, en: u64) -> Result<()> {
        let edition_infos = vec![
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.new_metadata.to_account_info(),
            ctx.accounts.new_edition.to_account_info(),
            ctx.accounts.master_edition.to_account_info(),
            ctx.accounts.new_mint.to_account_info(),
            ctx.accounts.edition_mark_pda.to_account_info(),
            ctx.accounts.new_mint_authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.token_account_owner.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.new_metadata_update_authority.to_account_info(),
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ];
        msg!("Edition Account Infos Assigned");
        invoke(
            &mint_new_edition_from_master_edition_via_token(
                ctx.accounts.token_program.key(),
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
                en,
            ),
            edition_infos.as_slice(),
        )?;

        msg!("A New Edition Nft Minted !!!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct MintNFT<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub mint: UncheckedAccount<'info>,
    // #[account(mut)]
    pub token_program: Program<'info, Token>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub payer: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct CreateMetadataAccount<'info> {
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub mint: UncheckedAccount<'info>,
    // #[account(mut)]
    pub token_program: Program<'info, Token>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    // /// CHECK: This is not dangerous because we don't read or write from this account
    // #[account(mut)]
    // pub token_account: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub payer: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub rent: AccountInfo<'info>,
    // /// CHECK: This is not dangerous because we don't read or write from this account
    // #[account(mut)]
    // pub master_edition: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct CreateMasterEdition<'info> {
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub mint: UncheckedAccount<'info>,
    // #[account(mut)]
    pub token_program: Program<'info, Token>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    // /// CHECK: This is not dangerous because we don't read or write from this account
    // #[account(mut)]
    // pub token_account: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub payer: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub rent: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct CreateNewEdition<'info> {
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
    /// /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub rent: AccountInfo<'info>,
}
