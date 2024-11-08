//
//  MFMessageComposeViewController+EditDisabled.h
//  Axispay
//
//  Created by srikanth on 08/07/19.
//  Copyright © 2019 bloomsmobility. All rights reserved.
//

#import <MessageUI/MessageUI.h>

NS_ASSUME_NONNULL_BEGIN

@interface MFMessageComposeViewController (EditDisabled)
-(void)_setCanEditRecipients:(BOOL)value;
-(void)_setShouldDisableEntryField:(BOOL)value;
@end

NS_ASSUME_NONNULL_END
