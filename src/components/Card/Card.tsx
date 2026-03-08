import * as stylex from "@stylexjs/stylex";
import { card, fonts, notification } from "./Card.stylex";
import typography from "@/src/styles/typography";

type Props = {
  label: string;
  children?: React.ReactNode;
  alert?: string | number;
};

const Card = ({ label, alert, children }: Props) => {
  return (
    <>
      <div {...stylex.props(card.default)}>
        <div {...stylex.props(card.background)}>
          <div {...stylex.props(typography.default, fonts.title)}>
            {label}
            {alert !== undefined && (
              <span {...stylex.props(notification.default)}>{alert}</span>
            )}
          </div>

          <div {...stylex.props(card.listContainer)}>{children}</div>
        </div>
      </div>
    </>
  );
};
Card.displayName = "Component Card";

export default Card;
