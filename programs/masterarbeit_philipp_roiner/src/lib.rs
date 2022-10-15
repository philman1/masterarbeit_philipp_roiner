use anchor_lang::prelude::*;

mod instructions;
mod state;
use crate::make_offer::*;
use crate::mint_nft::*;
use instructions::*;

declare_id!("4euwMgqxB9GkxVBY7uXKRRuC68yhkNbsVUhDPYS1mbhD");

#[program]
pub mod masterarbeit_philipp_roiner {
    use super::*;

    pub fn mint_nft(
        ctx: Context<MintNFT>,
        creator_key: Pubkey,
        name: String,
        symbol: String,
        uri: String,
        allowed_license_types: u8,
    ) -> Result<()> {
        mint_nft_handler(ctx, creator_key, name, symbol, uri, allowed_license_types)
    }

    pub fn make_offer(
        ctx: Context<MakeOffer>,
        escrowed_tokens_of_offer_maker_bump: u8,
        im_offering_this_much: u64,
        how_much_i_want_of_what_you_have: u64,
    ) -> Result<()> {
        make_offer_handler(
            ctx,
            escrowed_tokens_of_offer_maker_bump,
            im_offering_this_much,
            how_much_i_want_of_what_you_have,
        )
    }

    //     pub fn mint_print_edition(ctx: Context<MintPrintEdition>) -> Result<()> {
    //         let cpi_program = ctx.accounts.token_program.to_account_info();
    //         let cpi_accounts = MintTo {
    //             mint: ctx.accounts.new_mint.to_account_info(),
    //             to: ctx.accounts.token_account.to_account_info(),
    //             authority: ctx.accounts.payer.to_account_info(),
    //         };
    //         let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    //         let result = mint_to(cpi_ctx, 1);
    //         if let Err(_) = result {
    //             return Err(error!(ErrorCode::MintFailed));
    //         }

    //         let accounts = vec![
    //             ctx.accounts.new_metadata.to_account_info(),
    //             ctx.accounts.new_edition.to_account_info(),
    //             ctx.accounts.master_edition.to_account_info(),
    //             ctx.accounts.new_mint.to_account_info(),
    //             ctx.accounts.edition_mark_pda.to_account_info(),
    //             ctx.accounts.new_mint_authority.to_account_info(),
    //             ctx.accounts.payer.to_account_info(),
    //             ctx.accounts.token_account_owner.to_account_info(),
    //             ctx.accounts.token_account.to_account_info(),
    //             ctx.accounts.new_metadata_update_authority.to_account_info(),
    //             ctx.accounts.metadata.to_account_info(),
    //             ctx.accounts.token_program.to_account_info(),
    //             ctx.accounts.system_program.to_account_info(),
    //             ctx.accounts.rent.to_account_info(),
    //         ];

    //         invoke(
    //             &mint_new_edition_from_master_edition_via_token(
    //                 ctx.accounts.token_program.key(),
    //                 ctx.accounts.new_metadata.key(),
    //                 ctx.accounts.new_edition.key(),
    //                 ctx.accounts.master_edition.key(),
    //                 ctx.accounts.new_mint.key(),
    //                 ctx.accounts.new_mint_authority.key(),
    //                 ctx.accounts.payer.key(),
    //                 ctx.accounts.token_account_owner.key(),
    //                 ctx.accounts.token_account.key(),
    //                 ctx.accounts.new_metadata_update_authority.key(),
    //                 ctx.accounts.metadata.key(),
    //                 ctx.accounts.metadata.key(),
    //                 1,
    //             ),
    //             &accounts.as_slice(),
    //         )?;

    //         Ok(())
    //     }
}

// #[derive(Accounts)]
// pub struct MintPrintEdition<'info> {
//     /// CHECK: This is not dangerous because we don't read or write from this account
//     #[account(mut)]
//     pub new_metadata: UncheckedAccount<'info>,
//     /// CHECK: This is not dangerous because we don't read or write from this account
//     #[account(mut)]
//     pub new_edition: UncheckedAccount<'info>,
//     /// CHECK: This is not dangerous because we don't read or write from this account
//     #[account(mut)]
//     pub master_edition: UncheckedAccount<'info>,
//     /// CHECK: This is not dangerous because we don't read or write from this account
//     #[account(mut)]
//     pub new_mint: UncheckedAccount<'info>,
//     /// CHECK: This is not dangerous because we don't read or write from this account
//     #[account(mut)]
//     pub edition_mark_pda: UncheckedAccount<'info>,
//     #[account(mut)]
//     pub new_mint_authority: Signer<'info>,
//     /// CHECK: This is not dangerous because we don't read or write from this account
//     #[account(mut)]
//     pub payer: AccountInfo<'info>,
//     /// CHECK: This is not dangerous because we don't read or write from this account
//     #[account(mut)]
//     pub token_account_owner: UncheckedAccount<'info>,
//     /// CHECK: This is not dangerous because we don't read or write from this account
//     #[account(mut)]
//     pub token_account: UncheckedAccount<'info>,
//     /// CHECK: This is not dangerous because we don't read or write from this account
//     #[account(mut)]
//     pub new_metadata_update_authority: UncheckedAccount<'info>,
//     /// CHECK: This is not dangerous because we don't read or write from this account
//     #[account(mut)]
//     pub metadata: UncheckedAccount<'info>,
//     // #[account(mut)]
//     pub token_program: Program<'info, Token>,
//     pub system_program: Program<'info, System>,
//     /// CHECK: This is not dangerous because we don't read or write from this account
//     pub rent: AccountInfo<'info>,
// }
