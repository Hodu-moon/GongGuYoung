package xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString(callSuper = true)
@SuperBuilder(toBuilder = true)
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class InquireDemandDepositAccountBalanceRequest extends BaseRequest{
    private String accountNo;
}
