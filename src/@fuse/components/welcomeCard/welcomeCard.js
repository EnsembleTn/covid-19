import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Skeleton from "@material-ui/lab/Skeleton";
const useStyles = makeStyles({
  root: {
    maxWidth: 345,
    minWidth: 345,
    textAlign: "center"
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "auto",
    marginRight: "auto"
  },

  text: {
    textAlign: "center",
    height: 100
  },
  title: {
    paddingTop: "2rem",
    textTransform: "uppercase",
    fontSize: "1vw",
    fontWeight: "bold",
    color: "grey"
  },
  button: {}
});

export default function WelcomeCard({
  title,
  text,
  icon,
  handleClick,
  buttonContent,
  src
}) {
  const classes = useStyles();
  console.log("src", src);

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <CardContent className={classes.cardContent}>
          <Skeleton
            animation={false}
            variant="circle"
            width={90}
            height={90}
            className={classes.iconContainer}
          >
            <img src={src} className={classes.icon} />
          </Skeleton>

          <Typography
            gutterBottom
            variant="h5"
            component="h2"
            className={classes.title}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            component="p"
            className={classes.text}
          >
            {text}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button
          size="small"
          color="primary"
          onClick={handleClick}
          className={classes.button}
        >
          {buttonContent}
        </Button>
      </CardActions>
    </Card>
  );
}
