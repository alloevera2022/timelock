import React from 'react';
import styles from './button.module.scss';
import { Link } from "react-router-dom";

const Button = ({
                  title,
                  size = 'normal',
                  icon,
                  outline,
                  onClick,
                  type = 'button',
                  to,
                  className,
                  children
}) => {


  if (type === 'link') {
    return (
      <a
        href={to}
        className={`
            ${styles.button} 
            ${outline ? styles.outline : ''}
            ${size === 'large' ? styles.large : styles.normal}
            ${className ? className : ''}
          `}
        target={'_blank'}
      >
        {icon && icon}
        {title && <span className={styles.title}>{title}</span>}
        {children && <span className={styles.title}>{children}</span>}
      </a>
    )
  }
  else if (type === 'innerLink') {
    return (
      <Link
        to={to}
        className={`
            ${styles.button} 
            ${outline ? styles.outline : ''}
            ${size === 'large' ? styles.large : styles.normal}
            ${className ? className : ''}
          `}
      >
        {icon && icon}
        {title && <span className={styles.title}>{title}</span>}
        {children && <span className={styles.title}>{children}</span>}
      </Link>
    )
  }
  else {
    return (
      <button
        className={`
            ${styles.button} 
            ${outline ? styles.outline : ''}
            ${size === 'large' ? styles.large : styles.normal}
            ${className ? className : ''}
          `}
        onClick={onClick}
      >
        {icon && icon}
        {title && <span className={styles.title}>{title}</span>}
        {children && <span className={styles.title}>{children}</span>}
      </button>
    )
  }
}

export default Button;