use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCodes {
    #[msg("Mint failed!")]
    MintFailed,

    #[msg("Metadata account create failed!")]
    MetadataCreateFailed,
}
